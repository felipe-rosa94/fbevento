import React from 'react'
import '../styles/dashbord.css'
import {
    AppBar,
    IconButton,
    Toolbar,
    Typography,
    Hidden,
    Drawer,
    Divider,
    FormLabel,
    Card,
    CardMedia,
    CardContent,
    Button,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Dialog,
    Box,
    MenuItem,
    Menu,
    CircularProgress,
    ListItemIcon,
    TextField
} from '@material-ui/core'
import {
    AccountCircle,
    NotificationsActive,
    Message,
    MoreVert,
    Edit,
    Lock,
    ExitToApp,
    Menu as MenuIcon
} from '@material-ui/icons'
import {makeStyles} from '@material-ui/core/styles'
import {BASE_URL, hideData, mobile, requisicao, showData, token} from '../util'
import moment from 'moment'

const drawerWidth = 240
let identificacao

const classes = makeStyles((theme) => ({
    root: {
        display: 'flex',
    },
    drawer: {
        [theme.breakpoints.up('sm')]: {
            width: drawerWidth,
            flexShrink: 0,
        },
    },
    toolbar: theme.mixins.toolbar,
    drawerPaper: {
        width: drawerWidth,
    }
}))

class Dashbord extends React.Component {

    state = {
        dialogAviso: false,
        loadAviso: true,
        openMenu: false,
        openOptions: false,
        drawer: false,
        eventos: [],
        dialogParticipar: false,
        mensagemParticipacao: '',
        participar: false,
        notificacoes: [],
        notificacao: false,
        dialogNotificacao: false,
        dialogAlterarSenha: false,
        senhaAtual: '',
        senhaNova: '',
        repetiSenhaNova: ''
    }

    handleInput = e => this.setState({[e.target.name]: e.target.value.trim()})

    onClickPerfil = () => this.props.history.push(`/admin/cadastro/?token=${identificacao}`)

    onClickLogout = () => {
        localStorage.clear()
        this.props.history.push(`/admin/login/?token=${identificacao}`)
    }

    onClickParticipar = async () => {
        try {
            let {nome, cpf, free, id_evento, participar} = this.state
            free = (free === undefined || free === null) ? [] : free
            let json_free = {
                nome: nome,
                cpf: cpf,
                status: 'pendente'
            }
            if (participar) {
                free.push(json_free)
            } else {
                let index = -1
                for (let i = 0; i < free.length; i++) {
                    if (json_free.cpf === free[i].cpf) {
                        index = i
                        break
                    }
                }
                free.splice(index, 1)
            }
            let json_evento = {
                id: id_evento,
                free: free
            }
            this.setState({dialogParticipar: false})
            const resposta_evento = await requisicao(`${BASE_URL}/db/evento`, {
                headers: {
                    token: process.env.REACT_APP_TOKEN,
                    tokenid: identificacao
                },
                method: 'put',
                body: JSON.stringify(json_evento)
            })
            if (resposta_evento.sucesso) {
                if (participar) {
                    // let json_email = {
                    //     to: email,
                    //     subject: 'Participação em evento adicionada',
                    //     text: `Olá ${nome}, seu pedido de participação no evento da data ${data_evento} foi adicionado, aguarde até o responsável pelo evento confirmar sua participação.`
                    // }
                    // requisicao(`${BASE_URL}/mail`, {
                    //     method: 'post',
                    //     body: JSON.stringify(json_email)
                    // })
                    this.setState({
                        dialogAviso: true,
                        mensagemAviso: 'Sua participação no evento foi adicionada, aguarde até o responsável entrar em contato',
                        loadAviso: false
                    })
                } else {
                    // let json_email = {
                    //     to: email,
                    //     subject: 'Participação em evento retirada',
                    //     text: `Olá ${nome}, seu pedido de retirada de participação no evento da data ${data_evento} foi realizado.`
                    // }
                    // requisicao(`${BASE_URL}/mail`, {
                    //     method: 'post',
                    //     body: JSON.stringify(json_email)
                    // })
                    this.setState({
                        dialogAviso: true,
                        mensagemAviso: 'Sua participação no evento foi removida',
                        loadAviso: false
                    })
                }
            }
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: onClickParticipar\n' + e)
        }
    }

    onClickAlterarSenha = async () => {
        try {
            let usuario = localStorage.getItem(`ce:usuario-${identificacao}`)
            usuario = (usuario !== null) ? showData(usuario) : {}
            const {senhaAtual, senhaNova, repetiSenhaNova} = this.state
            if (usuario.senha !== senhaAtual) return this.setState({
                dialogAviso: true,
                loadAviso: false,
                mensagemAviso: 'Senha atual não confere'
            })
            if (senhaNova === null || senhaNova === '') return this.setState({
                dialogAviso: true,
                loadAviso: false,
                mensagemAviso: 'Senha nova inválida'
            })
            if (senhaNova !== repetiSenhaNova) return this.setState({
                dialogAviso: true,
                loadAviso: false,
                mensagemAviso: 'Senha nova não confere'
            })
            const resposta_evento = await requisicao(`${BASE_URL}/free/alterarSenha`, {
                headers: {
                    token: process.env.REACT_APP_TOKEN,
                    tokenid: identificacao
                },
                method: 'post',
                body: JSON.stringify({
                    id: usuario.id,
                    password: senhaNova
                })
            })
            if (resposta_evento.sucesso) {
                this.setState({
                    dialogAviso: true,
                    loadAviso: false,
                    mensagemAviso: 'Senha alterada com sucesso!'
                })
                usuario.senha = senhaNova
                localStorage.setItem(`ce:usuario-${identificacao}`, hideData(usuario))
            } else {
                alert(resposta_evento.status)
            }
            this.setState({dialogAlterarSenha: false})
        } catch (e) {

        }
    }

    verificaLogin = () => {
        try {
            if (localStorage.getItem(`ce:login-${identificacao}`) === null)
                this.props.history.push(`/admin/login/?token=${identificacao}`)
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: verificaLogin\n' + e)
        }
    }

    usuario = () => {
        try {
            let usuario = localStorage.getItem(`ce:usuario-${identificacao}`)
            usuario = (usuario !== null) ? showData(usuario) : {}
            this.setState(usuario)
            this.verificaImagens(usuario.cpf)
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: usuario\n' + e)
        }
    }

    buscaEventos = async () => {
        try {
            this.setState({
                dialogAviso: true,
                loadAviso: true,
                mensagemAviso: 'Aguarde buscando eventos...'
            })
            const resposta_evento = await requisicao(`${BASE_URL}/db/evento`, {
                headers: {
                    token: process.env.REACT_APP_TOKEN,
                    tokenid: identificacao
                },
                method: 'get'
            })
            if (resposta_evento.sucesso) {
                this.setState({dialogAviso: false})
                let array = []
                const {dados} = resposta_evento
                dados.forEach(i => {
                    i.timestamp = new Date(i.data)
                    i.mes = new Date(i.data).getMonth()
                    let dataAtual = new Date()
                    i.timestamp.setDate(i.timestamp.getDate() + 1)
                    if (i.timestamp >= dataAtual)
                        array.push(i)
                })
                array.sort((a, b) => {
                    if (a.timestamp < b.timestamp) return -1
                    if (a.timestamp > b.timestamp) return 1
                    return 0
                })
                this.setState({eventos: array})
            } else {
                alert(resposta_evento.status)
            }
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: buscaEventos\n' + e)
        }
    }

    verificaImagens = async cpf => {
        try {
            const resposta_free = await requisicao(`${BASE_URL}/db/free/?q={"campo":"cpf","valor":"${cpf}"}`, {
                headers: {
                    token: process.env.REACT_APP_TOKEN,
                    tokenid: identificacao
                },
                method: 'get'
            })
            let notificacao = false
            let notificacoes = []
            if (resposta_free.sucesso) {
                if (resposta_free.dados.length > 0) {
                    let free = resposta_free.dados[0]
                    if (free.docfotostatus === 'Recusada') {
                        notificacoes.push('Foto documento recusada, reenvie com uma qualidade melhor')
                        notificacao = true
                    }
                    if (free.examefotostatus === 'Recusada') {
                        notificacoes.push('Foto do exame recusada, reenvie com uma qualidade melhor')
                        notificacao = true
                    }
                    if (free.certificadofotostatus === 'Recusada') {
                        notificacoes.push('Foto do certificado recusada, reenvie com uma qualidade melhor')
                        notificacao = true
                    }
                    if (free.rostofotostatus === 'Recusada') {
                        notificacoes.push('Foto de perfil recusada, reenvie com uma qualidade melhor')
                        notificacao = true
                    }
                    if (free.covidfotostatus === 'Recusada') {
                        notificacoes.push('Foto do comprovante de vacinação recusada, reenvie com uma qualidade melhor')
                        notificacao = true
                    }
                }
                this.setState({notificacoes: notificacoes, notificacao: notificacao})
                if (notificacao) this.setState({
                    dialogAviso: true,
                    mensagemAviso: 'Você tem novas notificações',
                    loadAviso: false
                })
            }
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: verificaImagens\n' + e)
        }
    }

    foraEvento = (free, cpf) => {
        try {
            if (free === undefined || free === null || free.length === 0)
                return true
            for (let i = 0; i < free.length; i++) {
                if (cpf === free[i].cpf)
                    return false
            }
            return true
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: foraEvento\n' + e)
        }
    }

    meses = mes => {
        try {
            if (mes === 0)
                return 'Janeiro'
            else if (mes === 1)
                return 'Fevereiro'
            else if (mes === 2)
                return 'Março'
            else if (mes === 3)
                return 'Abril'
            else if (mes === 4)
                return 'Maio'
            else if (mes === 5)
                return 'Junho'
            else if (mes === 6)
                return 'Julho'
            else if (mes === 7)
                return 'Agosto'
            else if (mes === 8)
                return 'Setembro'
            else if (mes === 9)
                return 'Outubro'
            else if (mes === 10)
                return 'Novembro'
            else if (mes === 11)
                return 'Dezembro'
        } catch (e) {
            alert('Mostre isso ao desenvolvedor do sistema\nFunção: meses\n' + e)
        }
    }

    componentDidMount() {
        identificacao = token(this.props.location.search)
        this.verificaLogin()
        this.usuario()
        this.buscaEventos()
    }

    render() {
        const {
            dialogAviso,
            loadAviso,
            mensagemAviso,
            openMenu,
            openOptions,
            anchorEl,
            drawer,
            nome,
            email,
            cpf,
            rostofoto,
            eventos,
            dialogParticipar,
            dialogAlterarSenha,
            mensagemParticipacao,
            notificacao,
            dialogNotificacao,
            notificacoes
        } = this.state
        return (
            <div id="dashbord">
                <AppBar position="static">
                    <Toolbar id="toolbar-dashbord" variant="dense">
                        <div className="div-toolbar">
                            <IconButton edge="start" color="inherit" aria-label="menu" sx={{mr: 2}}
                                        onClick={() => this.setState({drawer: !drawer})}>
                                <MenuIcon/>
                            </IconButton>
                            <Typography variant="h6" color="inherit" component="div">
                                Dashboard
                            </Typography>
                        </div>
                        <div className="div-toolbar">
                            {
                                !(mobile()) &&
                                <div>
                                    <FormLabel id="label-nome">{nome}</FormLabel>
                                </div>
                            }
                            <IconButton
                                color="inherit"
                                onClick={(e) => {
                                    this.setState({anchorEl: e.currentTarget, openOptions: true})
                                }}>
                                <AccountCircle/>
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={openOptions}
                                onClose={() => this.setState({openOptions: false})}>
                                {
                                    (mobile()) &&
                                    <MenuItem>
                                        {nome}
                                    </MenuItem>
                                }
                                {
                                    (mobile()) &&
                                    <Divider/>
                                }
                                <MenuItem onClick={this.onClickPerfil}>
                                    <ListItemIcon color="inherit">
                                        <Edit fontSize="small"/>
                                    </ListItemIcon>
                                    Editar Perfil
                                </MenuItem>
                                <MenuItem onClick={() => this.setState({openOptions: false, dialogAlterarSenha: true})}>
                                    <ListItemIcon color="inherit">
                                        <Lock fontSize="small"/>
                                    </ListItemIcon>
                                    Alterar Senha
                                </MenuItem>
                                <MenuItem onClick={this.onClickLogout}>
                                    <ListItemIcon color="inherit">
                                        <ExitToApp fontSize="small"/>
                                    </ListItemIcon>
                                    Logout
                                </MenuItem>
                            </Menu>
                            {
                                notificacao &&
                                <IconButton color="inherit" onClick={() => this.setState({dialogNotificacao: true})}>
                                    <NotificationsActive/>
                                </IconButton>
                            }
                        </div>
                    </Toolbar>
                </AppBar>
                <div id="div-drawer">
                    <nav className={classes.drawer} aria-label="mailbox folders">
                        <Hidden smUp implementation="css">
                            <Drawer variant="temporary" anchor='left' open={drawer}
                                    onClose={() => this.setState({drawer: !drawer})}
                                    classes={{
                                        paper: classes.drawerPaper,
                                    }}
                                    ModalProps={{
                                        keepMounted: true,
                                    }}>
                                <div>
                                    <div className={classes.toolbar}/>
                                    <div id="div-perfil-dashbord" onClick={this.onClickPerfil}>
                                        <CardMedia id="card-media-perfil" image={rostofoto}/>
                                        <Card id="card-perfil">
                                            <CardContent id="card-content-perfil">
                                                <FormLabel id="label-nome-drawer-perfil">{nome}</FormLabel>
                                                <Divider/>
                                                <FormLabel id="label-email-drawer-perfil">{email}</FormLabel>
                                            </CardContent>
                                        </Card>
                                    </div>
                                    <Divider/>
                                    <div id="div-versao">
                                        <FormLabel
                                            id="text-version">{`Versão: ${process.env.REACT_APP_VERSAO}`}</FormLabel>
                                    </div>
                                </div>
                            </Drawer>
                        </Hidden>
                    </nav>
                </div>
                <div id="container-dashbord">
                    {
                        eventos.map((i, index) => (
                            <div id="div-evento" key={index}>
                                {(() => {
                                    if (this.foraEvento(i.free, cpf) && (i.status.toLowerCase() !== 'pendente'))
                                        return (<div/>)
                                    else
                                        return (
                                            <Card id="card-evento" style={{background: `#${i.cor}`}}>
                                                <CardContent id="card-content-evento">
                                                    <div id="div-data-status-evento">
                                                        {(() => {
                                                            if (i.free !== undefined && i.free !== null && i.free.length !== 0) {
                                                                return (
                                                                    i.free.map(f => {
                                                                        if (f.cpf === cpf && f.status.toLowerCase() === 'pendente')
                                                                            return (<FormLabel
                                                                                id="label-status">Pendente</FormLabel>)
                                                                        else if (f.cpf === cpf && (f.status.toLowerCase() === 'confirmado' || f.status.toLowerCase() === 'confirmada'))
                                                                            return (<FormLabel
                                                                                id="label-status">Confirmado</FormLabel>)
                                                                        else if (f.cpf === cpf && f.status.toLowerCase() === 'recusado')
                                                                            return (<FormLabel
                                                                                id="label-status">Pendente</FormLabel>)
                                                                    })
                                                                )
                                                            }
                                                        })()}
                                                    </div>
                                                    <Divider/>
                                                    <div id="div-data-evento" style={{marginTop: 4}}>
                                                        <FormLabel
                                                            id="label-mes-data-evento">{this.meses(i.mes)}</FormLabel>
                                                        <div id="div-data-status">
                                                            <FormLabel
                                                                id="label-data-data-evento"> {moment(i.data).format('DD/MM/YYYY')}</FormLabel>
                                                            {
                                                                !this.foraEvento(i.free, cpf) &&
                                                                <MoreVert
                                                                    onClick={(e) => {
                                                                        this.setState({
                                                                            anchorEl: e.currentTarget,
                                                                            openMenu: true,
                                                                            id_evento: i.id,
                                                                            data_evento: i.data,
                                                                            free: i.free
                                                                        })
                                                                    }}
                                                                />
                                                            }
                                                            <Menu
                                                                anchorEl={anchorEl}
                                                                open={openMenu}
                                                                onClose={() => this.setState({openMenu: false})}
                                                            >
                                                                <MenuItem
                                                                    onClick={() =>
                                                                        this.setState({
                                                                            openMenu: false,
                                                                            dialogParticipar: true,
                                                                            participar: false,
                                                                            mensagemParticipacao: 'Deseja remover participação nesse evento?',
                                                                        })}>
                                                                    Remover participação
                                                                </MenuItem>
                                                            </Menu>
                                                        </div>
                                                    </div>
                                                    <Divider/>
                                                    <div id="div-dados-evento">
                                                        <FormLabel id="label-nome-dado-evento">{i.nome}</FormLabel>
                                                        <FormLabel id="label-local-dado-evento">{i.local}</FormLabel>
                                                    </div>
                                                    {
                                                        (i.funcoes !== undefined && i.funcoes !== null) &&
                                                        <div id="div-funcoes-necessarias">
                                                            <FormLabel id="label-funcoes-necessarias">
                                                                Funções necessárias
                                                            </FormLabel>
                                                            <Divider/>
                                                        </div>
                                                    }
                                                    {(() => {
                                                        if (i.funcoes !== undefined && i.funcoes !== null) {
                                                            return (
                                                                i.funcoes.map((f, index) => (
                                                                    <div id="div-item-funcoes" key={index}>
                                                                        <FormLabel
                                                                            id="label-funcao">{f.funcao}</FormLabel>
                                                                    </div>
                                                                ))
                                                            )
                                                        }
                                                    })()}
                                                    {
                                                        this.foraEvento(i.free, cpf) &&
                                                        <Button id="button-participar-evento" variant="outlined"
                                                                onClick={() => {
                                                                    this.setState({
                                                                        dialogParticipar: true,
                                                                        participar: true,
                                                                        mensagemParticipacao: 'Deseja adiconar participação nesse evento?',
                                                                        id_evento: i.id,
                                                                        data_evento: i.data,
                                                                        free: i.free
                                                                    })
                                                                }}>
                                                            Participar
                                                        </Button>
                                                    }
                                                </CardContent>
                                            </Card>
                                        )
                                })()}
                            </div>
                        ))
                    }
                </div>
                <div id={'div-versao'}>
                    <FormLabel
                        id="text-version">{`Versão: ${process.env.REACT_APP_VERSAO}`}</FormLabel>
                </div>
                <Dialog open={dialogAlterarSenha} onClose={() => this.setState({dialogAlterarSenha: false})}>
                    <DialogTitle>Alterar senha</DialogTitle>
                    <DialogContent>
                        <DialogContentText>Deseja alterar sua senha?</DialogContentText>
                        <TextField
                            onChange={this.handleInput}
                            variant={'outlined'}
                            fullWidth={true}
                            name={'senhaAtual'}
                            label={'Senha atual'}
                            placeholder={'Senha atual'}/>
                        <Box p={1}/>
                        <div id={'div-dialog-nova-senha'}>
                            <TextField
                                onChange={this.handleInput}
                                variant={'outlined'}
                                fullWidth={true}
                                name={'senhaNova'}
                                label={'Nova senha'}
                                type={'password'}
                                placeholder={'Nova senha'}/>
                            <Box p={1}/>
                            <TextField
                                onChange={this.handleInput}
                                variant={'outlined'}
                                fullWidth={true}
                                name={'repetiSenhaNova'}
                                label={'Repetir senha'}
                                type={'password'}
                                placeholder={'Repetir senha nova'}/>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined"
                                onClick={() => this.setState({dialogAlterarSenha: false})}>Cancelar</Button>
                        <Button variant="outlined" onClick={this.onClickAlterarSenha}>Confirmar</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={dialogAviso}>
                    {
                        !(loadAviso) &&
                        <DialogTitle>Aviso</DialogTitle>
                    }
                    <DialogContent style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 8
                    }}>
                        {
                            (loadAviso) &&
                            <CircularProgress/>
                        }
                        {
                            (loadAviso) &&
                            <Box p={1}/>
                        }
                        <DialogContentText style={{
                            margin: 4
                        }}>{mensagemAviso}</DialogContentText>
                    </DialogContent>
                    {
                        !(loadAviso) &&
                        <DialogActions>
                            <Button variant="outlined" onClick={() => this.setState({dialogAviso: false})}>OK</Button>
                        </DialogActions>
                    }
                </Dialog>
                <Dialog open={dialogParticipar} onClose={() => this.setState({dialogParticipar: false})}>
                    <DialogTitle>Participar</DialogTitle>
                    <DialogContent>
                        <DialogContentText>{mensagemParticipacao}</DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => this.setState({dialogParticipar: false})}>Não</Button>
                        <Button variant="outlined" onClick={this.onClickParticipar}>Sim</Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={dialogNotificacao} onClose={() => this.setState({dialogNotificacao: false})}>
                    <DialogTitle>Notificações</DialogTitle>
                    <DialogContent>
                        {
                            notificacoes.map((n, index) => (
                                <Card key={index} id="card-notificacoes">
                                    <CardContent id="card-content-notificacoes">
                                        <Message/>
                                        <Box p={1}/>
                                        <FormLabel>{n}</FormLabel>
                                    </CardContent>
                                </Card>
                            ))
                        }
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined"
                                onClick={() => this.setState({dialogNotificacao: false})}>Fechar</Button>
                    </DialogActions>
                </Dialog>
            </div>
        )
    }
}

export default Dashbord
