const inquirer = require("inquirer")
const chalk = require("chalk")

const fs = require("fs")

operation()



function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'o que você deseja fazer?',
            choices: [
                'Criar Conta',
                'Consultar Saldo',
                'Depositar',
                'Sacar',
                'Sair']
        },
    ]).then((answer) => {

        const action = answer['action']

        if (action === 'Criar Conta') {
            criarConta()
        } else if (action === 'Consultar Saldo') {
            consultarSaldo()
        } else if (action === 'Depositar') {
            depositar()
        } else if (action === 'Sacar') {
            sacar()
        } else if (action === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o KingdomBank!'))
            process.exit()
        }


    })
        .catch(err => console.log(err))
}


function criarConta() {
    console.log(chalk.bgGreen.black('Parabéns por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))

    buildAccount()
    return
}

function buildAccount() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite um nome para sua conta'
        },
    ])
        .then((answer) => {
            const accountName = answer['accountName']

            console.info(accountName)

            if (!fs.existsSync('contas')) {
                fs.mkdirSync('contas')
            }

            if (fs.existsSync(`contas/${accountName}.json`)) {
                console.log(
                    chalk.bgRed.black('Esta conta já Existe, escolha outro nome')
                )
                buildAccount()
            }

            fs.writeFileSync(`contas/${accountName}.json`, '{"balance": 0}', function (err) {
                console.log(err)
            })
            console.log(chalk.green('Parabéns, a sua conta foi criada.'))
            operation()
        })
        .catch((err) => console.log(err))
}


function depositar() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ])
        .then((answer) => {

            const accountName = answer['accountName']

            if (!checkAccount(accountName)) {
                return depositar()

            }

            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Quanto você deseja depositar',
                },
            ]).then((answer) => {

                const amount = answer['amount']

                addAmount(accountName, amount)
                operation()

            }).catch((err => console.log(err)))
        })
        .catch(err => console.log(err))
}

function checkAccount(accountName) {
    if (!fs.existsSync(`contas/${accountName}.json`)) {
        console.log(chalk.bgRed.black('Esta conta não existe, escolha outro nome!'))
        return false
    }
    return true
}


function addAmount(accountName, amount) {

    const accountData = getAccount(accountName)


    if (!amount) {
        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return deposit()

    }
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)

    fs.writeFileSync(
        `contas/${accountName}.json`,
        JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )
    console.log(chalk.green(`foi depositado o valor de R$${amount} na sua conta`))

}


function getAccount(accountName) {
    const accountJSON = fs.readFileSync(`contas/${accountName}.json`, {
        encoding: 'utf8',
        flag: 'r'
    })

    return JSON.parse(accountJSON)
}

function consultarSaldo() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {
        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
            return consultarSaldo()

        }

        const accountData = getAccount(accountName)

        console.log(chalk.bgBlue.black(`Olá, o saldo da sua conta é R$${accountData.balance}`))
        operation()

    }).catch(err => console.log(err))
}


function sacar() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da sua conta?'
        }
    ]).then((answer) => {

        const accountName = answer['accountName']

        if (!checkAccount(accountName)) {
            return sacar()
        }

        inquirer.prompt([
            {
                name: 'amount',
                message: 'Quanto você deseja sacar?'
            }
        ]).then((answer) => {

            const amount = answer['amount']

            removeAmount(accountName, amount)


        })
            .catch((err) => console.log(err))


    }).catch((err) => console.log(err))
}

function removeAmount(accountName, amount) {

    const accountData = getAccount(accountName)

    if (!amount) {

        console.log(chalk.bgRed.black('Ocorreu um erro, tente novamente mais tarde!'))
        return sacar()
    }

    if (accountData.balance < amount) {
        console.log(chalk.bgRed.black('Valor indisponível!'))
        return sacar()
    }

    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)


    fs.writeFileSync(
        `contas/${accountName}.json`, JSON.stringify(accountData),
        function (err) {
            console.log(err)
        }
    )
    console.log(chalk.green(`Foi realizado um saque de R$${amount} da sua conta!`))
    operation()
}