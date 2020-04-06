
<p align="center">
<img src="https://i.imgur.com/ZznEDCJ.jpg" height="260" width="300">
</p>

# Mara Detetive

**Este repositório contém arquivos e códigos que foram criados no prazo de alguns dias apenas para fins de validação e testes da nossa idéia. Em nenhum momento nos preocupamos com a arquitetura por trás para obtermos um sistema mais robusto. Caso a idéia vá pra frente, tudo isso será refeito e reestruturado.**

### Introdução
A Mara Detetive nasceu com o propósito de se tornar um assistente virtual capaz de não só, identificar a veracidade de uma notícia como também auxiliar na disseminação de informações. Com o avanço das redes sociais e principalmente dos aplicativos de envio de mensagens, também tivemos um avanço da disseminação de notícias falsas, uma vez que as pessoas estão conseguindo obter informações (nem sempre verdadeiras) de forma mais acelerada.

Podemos perceber que esse problema é causado muitas vezes pela preguiça de ir atrás da notícia em fontes confiáveis ou também pela auto confiança de que aquilo é realmente verdade. Além disso,as pessoas sentem cada vez mais necessidade de conseguir informações de maneira facil e rápido para problemas reais do seu dia da dia.

### A Idéia
Diante desse cenário e da dificuldade em controlar a velocidade que uma notícia falsa pode se propagar, imaginamos um cenário onde o usuário antes de encaminhar uma notícia que recebeu pelo Whatsapp a algum amigo ou grupo específico, ela possa encaminhar essa mensagem para um Bot que consiga extrair aquela notícia e através de um modelo pré-treinado com notícias falsas e verdadeiras, consiga saber se aquela notícia é verdadeira ou não. Não só isso como também, a pessoa poderá procurar por um determinado restaurante o farmácia visto que com a quarentena muitos estabelecimentos estão fechados. 

### Como fazer isso:
Para colocar essa idéia em prática utilizaremos algumas ferramentas já disponíveis no mercado que agilizam muito no processo de desenvolvimento: 

### [Twilio - Whatsapp:]("https://www.twilio.com/whatsapp")
Serviço que possibilita a troca de mensagens através do Whatsapp. No projeto utilizamos para fazer a troca de mensagem entre o Assistant e o usuário.

### [Twilio - SMS:]("https://www.twilio.com/sms")
Serviço que possibilita o envio de SMS para algum usuário. No projeto usamos para simular o envio de uma notificação quando o usuário não encontra a notícia que ele procurou. Nesse caso, o número de algum responsável fica cadastrado no sistema e assim quando ele receber essa notificação, ele pode ir atrás das informações necessárias para treinar o modelo.

### [IBM Waston Discovery:]("https://www.ibm.com/br-pt/cloud/watson-discovery")
Serviço que ajuda na criação  de aplicativos relacionados a dados, contando com exploração cognitiva e Inteligência Artificial. Utilizamos ele para criar modelos e treiná-los com notícias falsas e verdadeiras. Além de inserir as notícias, podemos treinar a relevância dos resultados para tornar as respostas mais assertivas. Conforme os usuários usam o serviço, podemos capturar as mensagens que eles estão enviando e usar isso para o treinamento.

### [IBM Waston Assistant:]("https://www.ibm.com/cloud/watson-assistant/")
Serviço que auxilia na criação de chatbots. No projeto utilizamos para fazer a ponte entre o serviço de envio de mensagens no Whatsapp disponibilizado pela Twilio e o Watson Discovery.
Funciona assim: Assim que o Watson Assistant recebe uma mensagem, ele analisa qual a intenção do usuário ao enviar aquela mensagem(por exemplo, uma saudação, despedida ou um envio de alguma notícia para análise). Enquanto o assistant não entende que o usuário quer analisar uma notícia, ele apenas vai interagindo com a pessoa com as mensagens que ele foi treinado para enviar. A partir do momento que ele entende que a mensagem é uma notícia que deve ser analisada, ele envia essa mensagem para o Watson Discovery para que ele busque por informações sobre a veracidade. Quando o Discovery obtém uma resposta, ele a retorna e a partir daí o Assistant pode confirmar com o usuário se é aquilo que ele estava buscando ou não.

### [IBM Cloud Functions:]("https://developer.ibm.com/api/view/cloudfunctions-prod:cloud-functions#Overview")

Para unir todos esses serviços criamos um script em NodeJS e colocamos no Cloud Functions da IBM.

### Como testar o serviço:
- Enviar uma mensagem com o código **join topic-ready** para o número +1 415 523 8886. A partir daí você poderá interagir com o assistente.

As imagens abaixo, mostram os possíveis cenários de interação. Por se tratar de um ambiente de testes, ainda não foi coberto todos os possíveis cenários e erros podem vir a acontecer.

Ex: Fake News sobre o áudio enviado pelo ministro da saúde. Fonte: https://www.saude.gov.br/fakenews/46588-ministro-da-saude-pede-para-compartilhar-audio-com-informacoes-do-coronavirus-e-fake-news

| | |
|:-------------------------:|:-------------------------:|
<img src="https://i.imgur.com/p8zookR.jpg" height="550" width="280"> | <img src="https://i.imgur.com/idIekNJ.jpg" height="550" width="280"> 

No exemplo abaixo, é solicitada a análise de uma notícia na qual o modelo ainda não foi treinado. Nesse caso, ele busca algo no qual ele acha que pode ser o que o usuário está pedindo. Quando o usuário informa que aquela informação não é o que ele solicitou, enviamos um SMS notificando algum responsável que existe uma possível nova fake news se espalhando e com isso, ele pode ir analisá-la. Essa busca que o usuário fez, poderia ficar salvo em um banco e ser exibido em uma página web(Ainda não foi implementado) e quando o responsável receber a notificação, ele pode ir nesse site obter mais informações sobre a nova possível Fake News.

Ex: Rússia anuncia cura para coronavirus. Fonte: https://www.saude.gov.br/fakenews/46653-russia-anuncia-cura-para-coronavirus-e-fake-news (No momento, é uma fake news - 03/04/2020)

| | |
|:-------------------------:|:-------------------------:|
<img src="https://i.imgur.com/nA5BxUp.jpg" height="550" width="280"> | <img src="https://i.imgur.com/LX2TREY.jpg" height="550" width="280">

As notícias utilizadas para treinar o modelo foram tiradas do site: https://www.saude.gov.br/fakenews

#### Alguns exemplos de noticias utilizadas são:
- [Utilizar álcool em gel nas mãos para prevenir coronavírus altera bafômetro nas blitz](https://www.saude.gov.br/fakenews/46467-utilizar-alcool-em-gel-nas-maos-para-prevenir-coronavirus-altera-bafometro-nas-blitz-e-fake-news)
- [Álcool em gel é a mesma coisa que nada](https://www.saude.gov.br/fakenews/46463-alcool-em-gel-e-a-mesma-coisa-que-nada-e-fake-news)
- [Aplicativo Coronavírus-SUS, do Governo do Brasil, é inseguro](https://www.saude.gov.br/fakenews/46586-aplicativo-coronavirus-sus-do-governo-do-brasil-e-inseguro-e-fake-news)
- [Áudio do professor titular de cirurgia torácica da USP/HC/Incor](https://www.saude.gov.br/fakenews/46575-audio-do-professor-titular-de-cirurgia-toracica-da-usp-hc-incor-e-verdade)
- [Ministro da Saúde Luiz Henrique pede para compartilhar áudio](https://www.saude.gov.br/fakenews/46588-ministro-da-saude-pede-para-compartilhar-audio-com-informacoes-do-coronavirus-e-fake-news)
- [Beber muita água e fazer gargarejo com água morna, sal e vinagre previne coronavírus](https://www.saude.gov.br/fakenews/46582-beber-muita-agua-e-fazer-gargarejo-com-agua-morna-sal-e-vinagre-previne-coronavirus-e-fake-news)
- [Chá de erva doce e coronavírus](https://www.saude.gov.br/fakenews/46440-cha-de-erva-doce-e-coronavirus-e-fake-news)
- [Governo do Brasil anuncia vacina do coronavírus](https://www.saude.gov.br/fakenews/46585-governo-do-brasil-anuncia-vacina-do-coronavirus-e-fake-news)
- [Médicos tailandeses curam coronavírus em 48h](https://www.saude.gov.br/fakenews/46367-medicos-tailandeses-curam-coronavirus-em-48h-e-fake-news)
- [Receita de coco que cura coronavírus](https://www.saude.gov.br/fakenews/46479-receita-de-coco-que-cura-coronavirus-e-fake-news)
- [Tribunal chinês para matar 20 mil pacientes com coronavírus](https://www.saude.gov.br/fakenews/46439-tribunal-chines-para-matar-20-mil-pacientes-com-coronavirus-e-fake-news)





