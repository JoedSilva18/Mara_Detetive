// Biblioteca do twilio
const twilio = require('twilio');
// Biblioteca do mongo
const mongodb = require('mongodb');
// Bibliotecas do IBM Watson
const DiscoveryV1 = require('ibm-watson/discovery/v1');
const AssistantV2 = require('ibm-watson/assistant/v2');
const { IamAuthenticator } = require('ibm-watson/auth');

const sleep = require('util').promisify(setTimeout);

//String de conexao do mongodb
const uri = 'mongodb+srv://jarvis:uploaddeploy@cluster0-6gbip.mongodb.net/test?retryWrites=true&w=majority';

let discovery;
let assistant;

async function main(parametros) {

  try {
    // Conexao com o mongodb
    const client = await mongodb.MongoClient.connect(uri);

    // Instancia do Watson Discovery
    discovery = new DiscoveryV1({
      version: parametros.VERSION_DISCOVERY,
      authenticator: new IamAuthenticator({
        apikey: parametros.APIKEY_DISCOVERY,
      }),
      url: parametros.URL_DISCOVERY,
    });

    // Instancia do Watson Assistent
    assistant = new AssistantV2({
      version: parametros.VERSION_ASSISTANT,
      authenticator: new IamAuthenticator({
        apikey: parametros.APIKEY_ASSISTANT,
      }),
      url: parametros.URL_ASSISTANT,
    });

    // Mensagem sem quebra de linhas
    const msgNoBreak = parametros.Body.replace(/\n/g, " ");

    // Id da sessao do watson assistent
    let session_id = await findSession(parametros.From);

    // Verifica se ja existe uma sessao associada aquele numero
    if (!session_id) {
      // Se nao existir, cria uma nova
      session_id = await createSession(parametros.From, parametros.ASSISTANT_ID);
    }

    let message;

    try {
      // Tenta enviar a mensagem com a sessao existente
      message = await sendMessageToBot(parametros, msgNoBreak, session_id);
    } catch (err) {
      // Caso a sessao tenta expirado, deleta, cria uma nova e tenta enviar novamente
      await deleteSession(session_id, parametros.ASSISTANT_ID);
      await removeAnswers(session_id);
      session_id = await createSession(parametros.From, parametros.ASSISTANT_ID);
      message = await sendMessageToBot(parametros, msgNoBreak, session_id);
    }

    // "Intencao" que o watson assistent entendeu da mensagem do usuario 
    const intents = message.result.output.intents[0];
    // Texto retornado pelo watson assistent
    const text = message.result.output.generic[0].text;

    // Se o watson assistent nao captar nenhum intencao, retorna a mensagem 
    // default pedindo para o usuario reformular a pergunta
    if (intents === undefined) {
      parametros.mensagem = text;
      await sendWhatsappMessage(parametros);
    }

    // Se o watson assistent entender que a mensagem refere-se a uma noticia...
    else if (message.result.output.intents[0].intent === 'Noticia') {

      // Envia a mensagem retornada pelo assistent
      if (text) {
        parametros.mensagem = text;
        await sendWhatsappMessage(parametros);
      }

      // Salva a mensagem enviada pelo usuario
      await addQueries(parametros.From, msgNoBreak);

      // Faz uma requisicao ao Watson Discovery para procurar a noticia
      const queryParams = {
        environmentId: parametros.ENVIRONMENT,
        collectionId: parametros.COLLECTION,
        naturalLanguageQuery: msgNoBreak,
        count: 50
      };

      const queryResponse = await discovery.query(queryParams);

      // Armazena o resultado da consulta no banco
      await client.db('whatsapp').collection('answers').insert({
        assistantId: parametros.ASSISTANT_ID,
        sessionId: session_id,
        result: queryResponse.result.results[0]
      });

      // Verifica se o resultado possui uma alta probabilidade de ser a noticia procurada
      if (queryResponse.result.results[0].result_metadata.confidence > 0.75) {
        parametros.mensagem = 'Acho que encontrei!';
        await sendWhatsappMessage(parametros);
      } else {
        // Envia uma mensagem indicando que a noticia pode nao ser a correta
        parametros.mensagem = 'Encontrei algo mas não tenho certeza';
        await sendWhatsappMessage(parametros);
      }

      // Envia uma mensagem de confirmacao para o usuario indicar se eh aquela noticia ou nao
      parametros.mensagem = 'Sua notícia tem relação com o título *' + queryResponse.result.results[0].title + '*?';
      await sendWhatsappMessage(parametros);
    }
    // Se o watson assistent entender que a mensagem refere-se a uma saudacao...
    else if (message.result.output.intents[0].intent === 'Saudacao') {
      // Retorna a mensagem de saudacao do assistent
      if (text) {
        parametros.mensagem = text;
        await sendWhatsappMessage(parametros);
      }
    }
    // Se o watson assistent entender que a mensagem refere-se a uma confirmacao...
    else if (message.result.output.intents[0].intent === 'Confirmacao') {

      // Busca a noticia que ele salvou previamente no banco
      const result = await client.db('whatsapp').collection('answers').find({
        sessionId: session_id,
      }).toArray();

      // Se existir algum resultado...
      if (result[0] && result[0].result) {
        if (result[0].result.isFakeNews === 0) {
          // Envia a mensagem de que eh verdadeira
          parametros.mensagem = 'A notícia é *verdadeira*';
          await sendWhatsappMessage(parametros);
        } else if (result[0].result.isFakeNews === 1) {
          // Envia a mensagem de que eh falsa
          parametros.mensagem = 'A notícia é *falsa*';
          await sendWhatsappMessage(parametros);
        } else if (result[0].result.isFakeNews === 2) {
          // Envia a mensagem indicando que a noticia contem informacoes corretas e
          // informacoes incorretas
          parametros.mensagem = 'A notícia esta *incorreta*';
          await sendWhatsappMessage(parametros);
        }

        await sleep(3000);

        // Retorna todas a resposta quebrada em varias mensagens
        for (let i = 0; i < result[0].result.answers.length; i++) {
          parametros.mensagem = result[0].result.answers[i];
          await sendWhatsappMessage(parametros);
        }

        // Envia a fonte
        parametros.mensagem = 'Link da fonte para mais informações';
        await sendWhatsappMessage(parametros);

        parametros.mensagem = result[0].result.source;
        await sendWhatsappMessage(parametros);

        // Apaga a resposta do banco
        await removeAnswers(session_id);

      }
      // o assistent entendeu como uma confirmacao mas nao tinha nenhuma noticia salva
      // (ex: o usuario confirmou antes de perguntar por engano)
      else {
        parametros.mensagem = 'Por favor, diga sua noticia para que eu possa fazer uma análise';
        await sendWhatsappMessage(parametros);
      }
    }
    // Se o watson assistent entender que a mensagem refere-se a uma Despedida... 
    else if (message.result.output.intents[0].intent === 'Despedida') {
      // Envia a mensagem de despedida
      if (text) {
        parametros.mensagem = text;
        await sendWhatsappMessage(parametros);
      }
      // Deleta a sessao
      await deleteSession(session_id, parametros.ASSISTANT_ID);
    }
    // O assistent entendeu como uma negacao, nesse caso, o usuario indicou que
    // a noticia nao se refere ao que ele buscou. Provavelmente o watson discovery 
    // nao foi treinado com essa noticia
    else if (message.result.output.intents[0].intent === 'Negacao') {

      // Verifica se existe alguma resposta salva no banco
      const result = await client.db('whatsapp').collection('answers').find({
        sessionId: session_id,
      }).toArray();

      if (!result[0]) {
        parametros.mensagem = 'Por favor, diga sua noticia para que eu possa fazer uma análise';
        await sendWhatsappMessage(parametros);
      } else {
        if (text) {

          // Nesse caso, simulamos o envio de um SMS para o celular, onde o numero
          // poderia ser de uma pessoa responsavel por analisar as fake news. Nesse caso
          // ele seria notificado
          parametros.mensagem = 'Uma nova Fake News pode estar se espalhando';
          await sendSMS(parametros);

          parametros.mensagem = text;
          await sendWhatsappMessage(parametros);
        }

        // Remove a resposta do banco
        await removeAnswers(session_id);
      }
    }

    else if (message.result.output.intents[0].intent === 'Restaurante') {
      parametros.mensagem = text;
      await sendWhatsappMessage(parametros);
    }

    else if (message.result.output.intents[0].intent === 'Farmacia') {
      parametros.mensagem = text;
      await sendWhatsappMessage(parametros);
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: { Body: 'sucesso' },
    };
  } catch (err) {
    console.log(err)
    return Promise.reject({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: { message: err.message },
    });
  }
}

// Funcao que envia uma mensagem pelo Whatsapp
async function sendWhatsappMessage(parametros) {
  var client = new twilio(parametros.AccountSid, parametros.authToken);
  await client.messages.create({
    body: parametros.mensagem,
    to: parametros.From,
    from: parametros.To
  });
}

// Funcao que envia uma SMS
async function sendSMS(parametros) {
  var client = new twilio(parametros.AccountSid, parametros.authToken);

  const number = parametros.From.split(':');
  await client.messages.create({
    body: parametros.mensagem,
    to: number[1],
    from: '+17327197593',
  });
}

// Funcao que busca por uma sessao
async function findSession(From) {
  const client = await mongodb.MongoClient.connect(uri);
  const result = await client.db('whatsapp').collection('sessions').find({
    number: From,
  }).toArray();

  if (!result[0]) {
    return false;
  }

  return result[0].sessionId;
}


// Funcao que cria uma sessao no watson assistent
async function createSession(From, assistantId) {
  const client = await mongodb.MongoClient.connect(uri);
  const assistantResult = await assistant.createSession({
    assistantId: assistantId
  });

  await client.db('whatsapp').collection('sessions').insert({
    number: From,
    sessionId: assistantResult.result.session_id
  });

  return assistantResult.result.session_id;
}

// Funcao que deleta uma sessao do watson assistent
async function deleteSession(session_id, assistantId) {
  const client = await mongodb.MongoClient.connect(uri);

  await client.db('whatsapp').collection('sessions').remove({
    sessionId: session_id
  });

  /*await assistant.deleteSession({
    assistantId: assistantId,
    sessionId: session_id,
  });*/

}

// Funcao que envia uma mensagem para o watson assitent
async function sendMessageToBot(parametros, msgNoBreak, session_id) {
  const message = await assistant.message({
    assistantId: parametros.ASSISTANT_ID,
    sessionId: session_id,
    input: {
      'message_type': 'text',
      'text': msgNoBreak
    }
  });

  return message;
}


// Funcao que remove um resultado do discovery do banco
async function removeAnswers(session_id) {
  const client = await mongodb.MongoClient.connect(uri);

  await client.db('whatsapp').collection('answers').remove({
    sessionId: session_id,
  });
}

async function addQueries(From, querie) {
  const client = await mongodb.MongoClient.connect(uri);

  const number = From.split(':');

  await client.db('whatsapp').collection('queries').insert({
    number: number[1],
    querie: querie,
    date: new Date()
  });
}

global.main = main;