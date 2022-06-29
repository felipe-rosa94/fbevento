import React from 'react'
import '../styles/login.css'
import {
    AppBar,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormLabel,
    TextField,
    Toolbar,
    Typography
} from '@material-ui/core'
import {hideData, requisicao, token, BASE_URL, searchEmJSON} from '../util'

let identificacao

class Login extends React.Component {

    state = {
        email: '',
        senha: '',
        dialogEsqueci: false,
        dialogAviso: false,
        tituloAviso: '',
        mensagemAviso: '',
        dialogCarregando: false,
        mensagemCarregando: '',
        dialogAlterar: false
    }

    handleInput = e => {
        try {
            if (e.target.name === 'email')
                this.setState({[e.target.name]: e.target.value.toLowerCase()})
            else
                this.setState({[e.target.name]: e.target.value})
        } catch (e) {

        }
    }

    onClickEntrar = async () => {
        const {email, senha} = this.state
        const resposta_login = await requisicao(`${BASE_URL}/free/login`, {
            headers: {
                token: process.env.REACT_APP_TOKEN,
                tokenid: identificacao
            },
            method: 'post',
            body: JSON.stringify({email: email, password: senha})
        })
        if (resposta_login.sucesso) {
            localStorage.setItem(`ce:login-${identificacao}`, 'ok')
            resposta_login.dados.senha = senha
            localStorage.setItem(`ce:usuario-${identificacao}`, hideData(resposta_login.dados))
            this.props.history.push(`/admin/dashbord/?token=${identificacao}`)
        } else {
            alert(resposta_login.status)
        }
    }

    onClickCadastrar = () => this.props.history.push(`/admin/cadastro/?token=${identificacao}`)

    onClickEsqueci = async () => {
        const {email} = this.state
        this.setState({dialogEsqueci: false, dialogCarregando: true, mensagemCarregando: 'Gerando link de recuperação'})
        const resposta_recuperacao = await requisicao(`${BASE_URL}/free/recuperacao`, {
            headers: {
                token: process.env.REACT_APP_TOKEN,
                tokenid: identificacao
            },
            method: 'post',
            body: JSON.stringify({email: email})
        })
        if (resposta_recuperacao.sucesso) {
            let json_email = {
                to: email,
                subject: 'Recuperação de senha',
                text: ``,
                html: this.html(`${window.location.href}&id=${resposta_recuperacao.id}`)
            }
            const resposta_email = await requisicao(`${BASE_URL}/mail`, {
                method: 'post',
                body: JSON.stringify(json_email)
            })
            if (resposta_email.sucesso) {
                this.setState({
                    dialogCarregando: false,
                    dialogAviso: true,
                    tituloAviso: 'Aviso',
                    mensagemAviso: 'Um link de recuperação de senha foi enviado para seu e-mail'
                })
            } else {
                alert(resposta_email.status)
            }
        }
        this.setState({dialogCarregando: false})
    }

    onClickAlteraSenha = async () => {
        const {senha, id} = this.state
        const reposta_free = await requisicao(`${BASE_URL}/free/alterarSenha`, {
            headers: {
                token: process.env.REACT_APP_TOKEN,
                tokenid: identificacao
            },
            method: 'post',
            body: JSON.stringify({id: id, password: senha})
        })
        if (reposta_free.sucesso) {
            this.props.history.push(`/admin/login/?token=${identificacao}`)
            this.setState({dialogAlterar: false})
            alert('Senha alterada com sucesso')
        }
    }

    html = link => {
        return `<html lang="pt-br">
                <head>
                    <meta charset="UTF-8">                                   
                </head>
                <body>                   
                    <div id="div-main">                                        
                        <a href="${link}">Clique para recuperar a senha</a>                                                                                                  
                    </div>                                
                </body>                            
                </html>`
    }

    verificaLogin = () => {
        if (localStorage.getItem(`ce:login-${identificacao}`) !== null)
            this.props.history.push(`/admin/dashbord/?token=${identificacao}`)
    }

    verificaRecuperacao = async () => {
        try {
            let query = this.props.history.location.search
            if (!query) return
            const {id} = searchEmJSON(query)
            if (id === undefined) return
            this.setState({id: id, dialogAlterar: true, dialogCarregando: false})
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: verificaRecuperacao\n' + e)
        }
    }

    componentDidMount() {
        identificacao = token(this.props.location.search)
        this.verificaLogin()
        this.verificaRecuperacao()
    }

    render() {
        const {
            dialogCarregando,
            dialogEsqueci,
            dialogAviso,
            tituloAviso,
            mensagemAviso,
            mensagemCarregando,
            dialogAlterar
        } = this.state
        return (
            <div id="login">
                <AppBar position="static">
                    <Toolbar variant="dense">
                        <Typography variant="h6" color="inherit" component="div">
                            Login
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Card id="card-login">
                    <CardContent id="card-content-login">
                        <div className="div-formulario-login">
                            <TextField label={'E-mail ou  CPF'} variant="outlined" fullWidth placeholder="E-mail ou  CPF" onChange={this.handleInput}
                                       name="email"/>
                        </div>
                        <div className="div-formulario-login">
                            <TextField label={'Senha'} variant="outlined" type="password" fullWidth placeholder="Senha"
                                       onChange={this.handleInput} name="senha"/>
                        </div>
                        <div className="div-formulario-login">
                            <Button variant="outlined" fullWidth onClick={this.onClickEntrar}>Entrar</Button>
                        </div>
                        <div className="div-formulario-login">
                            <Button variant="outlined" fullWidth onClick={this.onClickCadastrar}>Cadastrar-me</Button>
                        </div>
                        {/*<div className="div-formulario-login">*/}
                        {/*    <FormLabel id="label-esqueci" onClick={() => this.setState({dialogEsqueci: true})}>*/}
                        {/*    <FormLabel id="label-esqueci"*/}
                        {/*               onClick={() => alert(email !== '' && email !== undefined ? email + '\nMostre essa mensagem para administrador do sistema' : 'Entre em contato com o administrador do sistema')}>*/}
                        {/*        Esqueci minha senha*/}
                        {/*    </FormLabel>*/}
                        {/*</div>*/}
                    </CardContent>
                </Card>
                <FormLabel>{`versão: ${process.env.REACT_APP_VERSAO}`}</FormLabel>
                <Dialog open={dialogAlterar} onClose={() => this.setState({dialogAlterar: false})}>
                    <DialogTitle>Altera de senha</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Digite sua nova senha</DialogContentText>
                        <TextField variant="outlined" fullWidth placeholder="Senha"
                                   onChange={this.handleInput} name="senha"/>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined"
                                onClick={() => this.setState({dialogAlterar: false})}>Cancelar</Button>
                        <Button variant="outlined"
                                onClick={this.onClickAlteraSenha}>confirmar</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={dialogEsqueci} onClose={() => this.setState({dialogEsqueci: false})}>
                    <DialogTitle>Recuperação de senha</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Digite o e-mail para enviar link de recuperação de senha</DialogContentText>
                        <TextField variant="outlined" fullWidth placeholder="E-mail"
                                   onChange={this.handleInput} name="email"/>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => this.setState({dialogAviso: false})}>Cancelar</Button>
                        <Button variant="outlined"
                                onClick={this.onClickEsqueci}>confirmar</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={dialogAviso} onClose={() => this.setState({dialogAviso: false})}>
                    <DialogTitle>{tituloAviso}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{mensagemAviso}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => this.setState({dialogAviso: false})}>Ok</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={dialogCarregando}>
                    <DialogContent id="dialog-carregando">
                        <CircularProgress size={30}/>
                        <DialogContentText id="label-carregando">{mensagemCarregando}</DialogContentText>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}

export default Login
