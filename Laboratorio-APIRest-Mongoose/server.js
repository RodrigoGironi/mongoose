const express       = require('express')
const logger        = require('morgan')
const bodyParser    = require('body-parser')
const errorHandler  = require('errorhandler')
const Mongoose      = require('mongoose')
const JSON          = require('circular-json')

Mongoose.Promise = global.Promise
Mongoose.connect('mongodb://127.0.0.1:27017/edx-apirest', {  useMongoClient: true})

const app = express()

app.use(logger('dev'))
app.use(bodyParser.json())
//app.use(errorHandler)

//model mongoose
const Account = Mongoose.model('Account', {
    name: String,
    balance: Number
})

const QyCreate = (n, b) => {
    const ac = new Account({
        name: n,
        balance: b
    })

    ac.save((erro) => {
        if(erro)
        {
            console.error(erro)
        }
        else{
            console.log('Add dat')
            Mongoose.disconnect()
        }
    })
}

const QyFindById = (id) => {
    let dt = Account.findById({ _id: id },(erro, dat) => {
        if(erro){
            console.error(erro)            
        }

        return dat
    })

    return dt
}

const QyFind = () => {

    let dt = Account.find({},null,{ sort: {_id: -1}},(erro, accounts) => { 
        if(erro){
            console.error(erro)
        }
        else{
            return accounts
        }
    })

    return dt
}

const QyUpdate = (num, n) => {

    let dt = Account.update({balance: num}, {$set:{name: n}}).exec((erro)=>{
        
        if(erro){
            console.error(erro)
        }

    }).find({balance: num}).exec((erro, dat)=>{
        
        if(erro){
            console.error(erro)
        }
        
        return dat
    })

    return dt
}

const QyDelete = (num) => {

   let dt = Account.remove({ balance: num }).exec((erro)=> {
        if(erro){
            console.error(erro)
        }
        else{
            return (`Remove itens (balance - ${num} )`)
        }
    })

    return dt

}

app.get('/data', (req, resp) => {
    if(req.query.name != null && req.query.balance != null){
        QyCreate(req.query.name, req.query.balance)
        let dat = QyFind()
        resp.send(dat.toJSON)
    }
    else
    {
        let dat = QyFind()
        resp.send(JSON.stringify(dat))
    }      
})

app.post('/data/:id', (req, resp) => {
    let dat = QyFindById(req.params.id)
    resp.send(JSON.stringify(dat))
})

app.put('/data/:number/info', (req, resp) => {

    if(req.params.number != null && req.query.name != null){
        let dat = QyUpdate(req.params.number, req.query.name )
        resp.send(JSON.stringify(dat))
    }
    else{
        resp.send(status(200),'You need to add param two for the update!')
    }
    
})

app.delete('/data/:number', (req, resp) => {
    if(req.params.number != null){
        let dat = QyDelete(req.params.number)
        resp.send(JSON.stringify(dat))
    }
    else{
        resp.send(status(200),'You need to add param two for the update!')
    }
})


app.listen(3000)

