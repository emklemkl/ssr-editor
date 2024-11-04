# SSR Editor
DV1677 JSRamverk

## MongoDB test db
- Start mongodb container `docker-compose up --remove-orphans`
- Start mongo service `mongosh mongodb://localhost:27017/`

## Kom igång
För att komma igång med applikationen laddade vi ner zip-filen "ssr-editor". Sedan körde vi 'npm install' och skapade även en '.env' fil för att tilldela applikationen ett portnummer. Vi gjorde även diverse mindre effektiviseringar som förenklar under arbetes gång. Bland annat saknade databasen en id-kolumn vilket gjorde det svårt att välja önskad rad, vi valde även att installera Nodemon-biblioteket för tillgång till "Hot reloads", samt att flytta reset_db.bash till projektroten. Flera av förändringarna är inte nödvändiga för appens funktionalitet, men de underlättar vår utvecklingsprocess och vi ser det som väl spenderad tid. 
Vi skapade ett repo på Emils GitHub och lade till Louise som samarbetspartner.

## Ramverk
Vi har valt att använda oss utav ramverket Angular. Efter att ha gått igenom videor och läst om de olika ramverken samt diskuterat sinsemellan, kom vi fram till att vi båda kände att Angular verkade ha en bra struktur och kan passa bra för vårt kommande uppdrag. Ramverket Angular har ingen av oss tidigare erfarenhet av och vi kände att vi ville utmana oss själva och gå utanför vår komfortzon för att lära oss något nytt. Då ingen av oss tidigare har arbetat med något av de relevanta ramverken så kan det till viss del vara utmanande att göra ett välgrundat val. Vi gick till stor del på slutsatsen som drogs i [Choosing your JS framework](https://www.youtube.com/watch?v=dHptnyroFNA) där man råddes att välja det som känns rätt och inte lägga för mycket vikt vid andras eventuellt subjektiva åsikter.

# API docs

## POST /create
**Description**: Creates a new document.  
**Request Body**:
```json
{
  "title": "<A title>",
  "content": "<Some text content>"
}
```
**Response**:  
- Success: `201 Created`  
- Failure: `500 Internal Server Error`  

---

## PUT /update
**Description**: Updates an existing document.  
**Request Body**:
```json
{
  "_id": "<document_id>",
  "title": "<new_title>",
  "content": "<new_text_content>"
}
```
**Response**:  
- Success: `204 No Content`  
- Failure: `500 Internal Server Error`  

---

## GET /all
**Description**: Fetches all documents.  
**Response**:  
```json
[
  {
    "_id": "<document_id>",
    "title": "Doc title",
    "content": "Doc content"
  },
  {
    "_id": "<document_id>",
    "title": "Doc Title",
    "content": "Doc content"
  }
]
```
- Success: `200 OK`

---

## GET /:id
**Description**: Fetches a document by its ID.  
**Response**:  
```json
{
  "_id": "<document_id>",
  "title": "Sample Title",
  "content": "Sample content of the document"
}
```
- Success: `200 OK`  
- Failure: `404 Not Found`
