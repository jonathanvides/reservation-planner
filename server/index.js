const {
    client,
    createTables,
    createCustomer,
    createRestaurant,
    createReservation,
    fetchCustomers,
    fetchRestaurants,
    fetchReservation,
    destroyReservation
} = require('./db');
const express = require('express');
const app = express();
app.use(express.json());

app.get('/api/customers',  async(req, res, next)=> {
    try {
        res.send(await fetchCustomers());
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/restaurants',  async(req, res, next)=> {
    try {
        res.send(await fetchRestaurants());
    }
    catch(ex){
        next(ex);
    }
});

app.get('/api/reservations',  async(req, res, next)=> {
    try {
        res.send(await fetchReservation());
    }
    catch(ex){
        next(ex);
    }
});

app.delete('/api/customers/:customer_id/reservations/:id',  async(req, res, next)=> {
    try {
        await destroyReservation({customer_id: req.params.customer_id, id: req.params.id});
        res.sendStatus(204);
    }
    catch(ex){
        next(ex);
    }
});

app.post('/api/customers/:customer_id/reservations',  async(req, res, next)=> {
    try {
        res.status(201).send(await createReservation({ customer_id: req.params.customer_id, restaurant_id: req.body.restaurant_id, date: req.body.date, party_count: req.body.party_count}));
    }
    catch(ex){
        next(ex);
    }
});

app.use((err, req, res, next)=> {
    res.status(err.status || 500).send({ error: err.message || err});
});
const init = async()=> {
    console.log('connecting to database');
    await client.connect();
    console.log('connected to database');
    await createTables();
    console.log('created tables');
    const [Jack, Bill, Mary, Susie, Olive, Burger, Truffle, Cheesecake ] = await Promise.all([
        createCustomer({ name: 'Jack'}),
        createCustomer({ name: 'Bill'}),
        createCustomer({ name: 'Mary'}),
        createCustomer({ name: 'Susie'}),
        createRestaurant({ name: 'Olive'}),
        createRestaurant({ name: 'Burger'}),
        createRestaurant({ name: 'Truffle'}),
        createRestaurant({ name: 'Cheesecake'}),
    ]);
    console.log(await fetchCustomers());
    console.log(await fetchRestaurants());
    
    const [reservation, reservation2] = await Promise.all([
        createReservation({
            customer_id: Jack.id,
            restaurant_id: Olive.id,
            date: '12/14/2024',
            party_count: 4
        }),
        createReservation({
            customer_id: Bill.id,
            restaurant_id: Burger.id,
            date: '12/28/2024',
            party_count: 6
        }),
        createReservation({
            customer_id: Mary.id,
            restaurant_id: Truffle.id,
            date: '12/30/2024',
            party_count: 2
        }),
        createReservation({
            customer_id: Susie.id,
            restaurant_id: Cheesecake.id,
            date: '1/28/2025',
            party_count: 3
        }),
    ]);
    console.log(await fetchReservation());
    await destroyReservation({ id: reservation.id, customer_id: reservation.customer_id});
    console.log(await fetchReservation());
    
    const port = process.env.PORT || 3000;
    app.listen(port, ()=> {
        console.log(`listening on port ${port}`);
    });
    
};

init();