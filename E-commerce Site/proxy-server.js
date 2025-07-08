const express= require('express');
const axios = require('axios');
const cors= require('cors');

const app= express();
const API_BASE= 'http://43.205.110.71:8000';
app.use(cors());

app.get('/categories', async (req, res) => {
    try{
        const response= await axios.get(`${API_BASE}/categories`);
        res.json(response.data);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/categories/:category/items', async (req, res) => {
    try{
        const response= await axios.get(`${API_BASE}/categories/${req.params.category}/items`);
        res.json(response.data);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

app.get('/items', async (req, res) => {
    try{
        const response= await axios.get(`${API_BASE}/items`);
        res.json(response.data);
    }catch(error){
        console.error(error);
        res.status(500).json({error: 'Internal Server Error'});
    }
});

const port= 4000;
app.listen(port, () => console.log(`Proxy server listening on port ${port}`));
app.get('/', (req, res) => res.send('Hello World!'));
