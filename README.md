# Jarvis Assistent

**Esse repositório contem arquivos e códigos que foram criados no prazo de alguns dias apenas para fins de validação e testes da nossa idéia. Em nenhum momento nos preocupamos com a arquitetura por tras para obtermos um sistema mais robusto. Caso a idéia vá pra frente, tudo isso sera refeito e reestruturado.**

### Introdução
O Jarvis Assistent nasceu com o propósito de se tornar um assistente virtual capaz de indentificar a veracidade de uma notícia. Com o avanço das redes sociais e pincipalmente dos aplicativos de envio de mensagens, também tivemos um avanço da disseminação de noticias falsas, uma vez que as pessoas estão conseguindo obter informações (nem sempre verdadeiras) de forma mais acelerada. 

Podemos perceber que esse problema é causado muitas vezes pela preguiça de ir atrás da noticia em fontes confiaveis ou também pela auto confiaça de que aquilo é realmente verdade.

### A Idéia
Diantes desse cenários e da dificuldade em controlar a velocidade que uma noticia falsa pode se propagar, imaginamos um cenário onde o usuário antes de encaminhar uma noticia que recebeu pelo Whatsapp a algum amigo ou grupo especifico, ela possa encaminhar essa mensagem para um Bot que consiga extrair aquela noticia e através de um modelo pré-treinado com noticias falsas e verdadeira, consiga saber se aquela noticia é verdadeira ou não.

# Como fazer isso:
Para colocar essa idéia em prática utilizaremos algumas ferramentas já disponíveis no mercado que agilizam muito no processo de desenvolvimento: 

### [Twilio - Whatsapp:]("https://www.twilio.com/whatsapp")
Serviço que possibilita a troca de mensagens através do Whatsapp. No projeto utilizamos para fazer a troca de mensagem entre o Assistent e o usuário.

### [Twilio - SMS:]("https://www.twilio.com/sms")
Serviço que possibilita o envio de SMS para algum usuário. No projeto usamos para simular o envio de uma noticiacao quando o usuario não encontra a noticia que ele procurou. Nesse caso, o numero de algum responsavel fica cadastrado no sistema e assim quando ele receber essa notificação, ele pode ir atras das informações necessárias para treinar o modelo.

### [IBM Waston Discovery:]("https://www.ibm.com/br-pt/cloud/watson-discovery")
Serviço que ajuda na criação  de aplicativos relacionados a dados, contando com exploração cognitiva e Inteligência Artificial. Utilizamos ele para criar modelos e treina-los com noticias falsas e verdadeiras. Além de inserir as noticias, podemos treinar a relevancia dos resultados para tornar as respostas mais acertivas. Conforme os usuarios usam o serviço, podemos capturar as mensagens que eles estao enviando e usar isso para o treinamento.

### [IBM Waston Assistent:]("https://www.ibm.com/cloud/watson-assistant/")
Serviço que auxilia na criação de chatbots. No projeto utilizamos para fazer a ponte entre o serviço de envio de mensagens no Whatsapp disponibilizado pela Twilio e o Watson Discovery.
Funciona assim: Assim que o Waston Assitent recebe uma mensagem, ele analisa qual a intenção do usuário ao enviar aquela mensagem(por exemplo, uma saudação, Despedida ou um envia de algum noticia para análise). Enquanto o assistent não entende que o usuário quer analisar uma noticia, ele apenas vai interangindo com a pessoa com as mensagens que ele foi treinado pra enviar. A partir do momento que ele entende que a mensagem é uma noticia que deve ser analisada, ele envia essa mensagem para o Watson Discovery para que ele busque por informações sobre a veracidade. Quando o Discovery obtem uma resposta, ele a retorna e a partir dai o Assistent pode confirmar com o usuario se é aquilo que ele estava buscando ou não.

### [IBM Cloud Functions:]("https://developer.ibm.com/api/view/cloudfunctions-prod:cloud-functions#Overview")

Para unir todos esses serviços criamos um script em NodeJS e colocamos  no Cloud Functions da IBM.

### Como testar o serviço:
- Enviar uma mensagem com o código **join topic-ready** para o número +1 415 523 8886. A partir daí você poderá interagir com o assistente.

As imagens abaixo, mostram os possíveis cenários de interação. Por se tratar de um ambiente de testes, ainda não foi coberto todos os possíveis cenários e erros podem vir a acontecer.

Ex: Fake News sobre o áudio enviado pelo ministro da saúde. Fonte: https://www.saude.gov.br/fakenews/46588-ministro-da-saude-pede-para-compartilhar-audio-com-informacoes-do-coronavirus-e-fake-news

| | |
|:-------------------------:|:-------------------------:|
<img src="https://i.imgur.com/p8zookR.jpg" height="550" width="280"> | <img src="https://i.imgur.com/idIekNJ.jpg" height="550" width="280"> 

No exemplo abaixo, é solicitada a analise de uma noticia na qual o modelo ainda não foi treinado. Nesse caso, ele busca algo no qual ele acha que pode ser o que o usuário esta pedindo. Quando o usuário informa que aquela informação não é o que ele solicitou, enviamos um SMS notificando algum responsavel que existe uma possivel nova fake news se espalhando e com isso, ele pode ir analisa-la. Essa busca que o usuario fez, poderia ficar salvo em um banco e ser exibido em uma pagina web(Ainda não foi implementado) e quando o responsavel receber a notificação, ele pode ir nesse site obter mais informações sobre a nova possivel Fake News.

Ex: Rússia anuncia cura para coronavirus. Fonte: https://www.saude.gov.br/fakenews/46653-russia-anuncia-cura-para-coronavirus-e-fake-news (No momento, é uma fake news - 03/04/2020)

| | |
|:-------------------------:|:-------------------------:|
<img src="https://i.imgur.com/nA5BxUp.jpg" height="550" width="280"> | <img src="https://i.imgur.com/LX2TREY.jpg" height="550" width="280">
