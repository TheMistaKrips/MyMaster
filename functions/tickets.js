const { MongoClient, ObjectId } = require('mongodb');

// Подключение к MongoDB
const uri = "your-mongodb-uri"; // Замените на ваш URI для подключения к MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

exports.handler = async (event, context) => {
    try {
        // Подключение к базе данных
        const db = client.db('ticketsDB');
        const ticketsCollection = db.collection('tickets');

        // GET - Получение всех заявок
        if (event.httpMethod === 'GET') {
            const tickets = await ticketsCollection.find().toArray();
            return {
                statusCode: 200,
                body: JSON.stringify(tickets),
            };
        }

        // POST - Добавление новой заявки
        if (event.httpMethod === 'POST') {
            const { name, phone, address, task, time, completed } = JSON.parse(event.body);
            const result = await ticketsCollection.insertOne({ name, phone, address, task, time, completed });
            return {
                statusCode: 200,
                body: JSON.stringify({ id: result.insertedId }),
            };
        }

        // PUT - Обновление заявки
        if (event.httpMethod === 'PUT') {
            const { id } = event.queryStringParameters;
            const { name, phone, address, task, time, completed } = JSON.parse(event.body);
            await ticketsCollection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { name, phone, address, task, time, completed } }
            );
            return {
                statusCode: 200,
                body: JSON.stringify({ updated: true }),
            };
        }

        // DELETE - Удаление заявки
        if (event.httpMethod === 'DELETE') {
            const { id } = event.queryStringParameters;
            await ticketsCollection.deleteOne({ _id: new ObjectId(id) });
            return {
                statusCode: 200,
                body: JSON.stringify({ deleted: true }),
            };
        }

        return {
            statusCode: 405,
            body: 'Method Not Allowed',
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
