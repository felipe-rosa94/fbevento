import React from 'react'
import '../styles/cadastro.css'
import {
    AppBar,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControl,
    FormLabel,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Toolbar,
    Typography,
    FormControlLabel,
    Checkbox
} from '@material-ui/core'
import {withStyles} from '@material-ui/core/styles'
import {ArrowBack} from '@material-ui/icons'
import moment from 'moment'
import {
    BASE_URL,
    hideData,
    isEmptyObject,
    mascaraData,
    mascaraTelefone,
    requisicao,
    searchEmJSON,
    showData,
    token,
    capitalize,
    validaCPF
} from '../util'
import Resizer from 'react-image-file-resizer'
import firebase from '../firebase'

const Check = withStyles({
    checked: {},
})(props => <Checkbox color="default" {...props} />)

let identificacao

class Cadastro extends React.Component {

    state = {
        index_covid: 0,
        index_funcao: 0,
        index_habilicacao: 0,
        index_uniforme: 0,
        lista_funcao: [],
        lista_covid: ['Nenhuma', '1° Dose', '2° Dose', '3° Dose', 'Dose única'],
        lista_habilitacao: ['Não tenho', 'A', 'B', 'C', 'D', 'E', 'AB', 'AC', 'AD', 'AE'],
        lista_uniforme: ['P', 'M', 'G', 'XG', 'XXG'],
        funcao: [],
        nome: '',
        email: '',
        telefone: '',
        cpf: '',
        rg: '',
        indicacao: '',
        erro_indicacao: false,
        nascimento: '',
        cep: '',
        numero: '',
        endereco: '',
        bairro: '',
        cidade: '',
        complemento: '',
        password: '',
        re_password: '',
        covidfoto: '',
        covidfotodata: '',
        docfoto: '',
        docfotodata: '',
        examefoto: '',
        examefotodata: '',
        certificadofoto: '',
        certificadofotodata: '',
        rostofoto: '',
        rostofotodata: '',
        carrocor: '',
        carromodelo: '',
        carroplaca: '',
        numero_carteira: '',
        dialogCarregando: false,
        dialogAviso: false,
        tituloAviso: '',
        mensagemAviso: '',
        editando: false,
        facebook: '',
        instagram: '',
        twitter: '',
        camera: false,
        erro_nome: false,
        erro_email: false,
        erro_nascimento: false,
        erro_telefone: false,
        erro_cpf: false,
        erro_rg: false,
        erro_rostofoto: false,
        erro_docfoto: false,
        erro_carroplaca: false,
        erro_carromodelo: false,
        erro_carrocor: false,
        erro_cep: false,
        erro_numero: false,
        erro_endereco: false,
        erro_bairro: false,
        erro_cidade: false,
        erro_uniforme: false,
        erro_password: false
    }

    handleInputs = async e => {
        if (e.target.name === 'cep') {
            this.validaCep(e.target.value)
        } else if (e.target.name === 'cpf') {
            this.validaCpf(e.target.value)
        } else if (e.target.name === 'email') {
            this.setState({[e.target.name]: e.target.value.toLowerCase()})
        } else if (e.target.name === 'nascimento') {
            this.setState({[e.target.name]: mascaraData(e.target.value)})
        } else if (e.target.name === 'password' || e.target.name === 're_password') {
            this.setState({[e.target.name]: e.target.value})
        } else if (e.target.name === 'telefone') {
            this.setState({[e.target.name]: mascaraTelefone(e.target.value)})
        } else if (e.target.name.includes('foto')) {
            const files = e.target.files[0]
            const image = await this.resizeFile(files)
            const file = this.dataURLtoFile(image, files.name)
            this.setState({[e.target.name]: file})
        } else {
            this.setState({[e.target.name]: (e.target.value.length > 0) ? capitalize(e.target.value) : e.target.value})
        }
    }

    resizeFile = (file) =>
        new Promise((resolve) => {
            Resizer.imageFileResizer(
                file,
                300,
                400,
                "JPEG",
                80,
                0,
                (uri) => {
                    resolve(uri);
                },
                "base64"
            )
        })

    dataURLtoFile(dataurl, filename) {
        let arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1], bstr = atob(arr[1]), n = bstr.length,
            u8arr = new Uint8Array(n)
        while (n--)
            u8arr[n] = bstr.charCodeAt(n)
        return new File([u8arr], filename, {type: mime})
    }

    validaCep = async cep => {
        cep = cep.replace(/[^\d]+/g, '')
        cep = cep.substring(0, 8)
        if (cep.length === 8) {
            this.setState({dialogCarregando: true, mensagemCarregando: 'Validando CEP'})
            let url = `https://viacep.com.br/ws/${cep}/json/`
            let endereco = await requisicao(url, {method: 'get'})
            this.setState({
                cep: cep,
                endereco: endereco.logradouro,
                bairro: endereco.bairro,
                cidade: endereco.localidade,
                dialogCarregando: false
            })
        } else {
            this.setState({cep: cep})
        }
    }

    validaCpf = cpf => {
        cpf = cpf.replace(/[^\d]+/g, '')
        cpf = cpf.substring(0, 11)
        this.setState({cpf: cpf})
    }

    uploadImagem = async (key, image) => {
        try {
            if (image === '') return ''
            this.setState({dialogCarregando: true, mensagemCarregando: 'Aguarde, fazendo upload do arquivo...'})
            const {_delegate: {state}} = await firebase
                .storage()
                .ref(`imagens/${identificacao}/${key}`)
                .put(image)
            this.setState({dialogCarregando: true, mensagemCarregando: 'Aguarde, obtendo URL...'})
            if (state === 'success') {
                this.setState({dialogCarregando: false})
                return await firebase
                    .storage()
                    .ref(`imagens/${identificacao}/${key}`)
                    .getDownloadURL()
            }
        } catch (e) {

        }
        return ''
    }

    checked = i => {
        const {funcao} = this.state
        return funcao.includes(i)
    }

    onCheckFuncao = (i, e) => {
        let {funcao} = this.state
        if (e.target.checked) {
            funcao.push(i)
        } else {
            funcao.splice(funcao.indexOf(i), 1)
        }
        this.setState({funcao: funcao})
    }

    onClickVoltar = () => this.props.history.goBack()

    onClickCadastrar = async () => {
        const {
            id,
            nome,
            email,
            nascimento,
            telefone,
            cpf,
            rg,
            indicacao,
            docfoto,
            examefoto,
            certificadofoto,
            index_habilicacao,
            lista_habilitacao,
            numero_carteira,
            carroplaca,
            carromodelo,
            carrocor,
            cep,
            numero,
            endereco,
            bairro,
            cidade,
            complemento,
            index_uniforme,
            lista_uniforme,
            funcao,
            password,
            re_password,
            covidfoto,
            rostofoto,
            index_covid,
            lista_covid,
            facebook,
            instagram,
            twitter,
            editando,
            docfotodata,
            examefotodata,
            certificadofotodata,
            rostofotodata,
            covidfotodata
        } = this.state

        let habilitacao = lista_habilitacao[index_habilicacao]
        let uniforme = lista_uniforme[index_uniforme]
        let covid = lista_covid[index_covid]
        if (nome === '') {
            this.setState({erro_nome: true})
            alert('Coloque um nome válido')
            return
        }
        if (nome.split(' ').length <= 1) {
            this.setState({erro_nome: true})
            alert('Coloque um sobrenome válido')
            return
        }
        if (email === '') {
            this.setState({erro_email: true})
            alert('Coloque um e-mail válido')
            return
        }
        if (nascimento.length < 10) {
            this.setState({erro_nascimento: true})
            alert('Coloque uma data válida')
            return
        }
        if (telefone.length < 14) {
            this.setState({erro_telefone: true})
            alert('Coloque um telefone válido')
            return
        }
        if (!validaCPF(cpf)) {
            this.setState({erro_cpf: true})
            alert('Coloque um cpf válido')
            return
        }
        if (rg === '') {
            this.setState({erro_rg: true})
            alert('Coloque um rg válido')
            return
        }
        if (indicacao === '') {
            this.setState({erro_indicacao: true})
            alert('Coloque uma indicação válida')
            return
        }
        if (rostofoto === '') {
            this.setState({erro_rostofoto: true})
            alert('Selecione uma foto de perfil')
            return
        }
        // if (docfoto === '') {
        //     this.setState({erro_docfoto: true})
        //     alert('Selecione a foto de um documento')
        //     return
        // }
        if (carroplaca !== '' || carromodelo !== '' || carrocor !== '') {
            if (carroplaca === '') {
                this.setState({erro_carroplaca: true})
                alert('Coloque a placa')
                return
            }
            if (carromodelo === '') {
                this.setState({erro_carromodelo: true})
                alert('Coloque o modelo')
                return
            }
            if (carrocor === '') {
                this.setState({erro_carrocor: true})
                alert('Coloque a cor')
                return
            }
        }
        if (cep.length < 8) {
            this.setState({erro_cep: true})
            alert('Coloque um cep válido')
            return
        }
        if (numero === '') {
            this.setState({erro_numero: true})
            alert('coloque um número válido')
            return
        }
        if (endereco === '') {
            this.setState({erro_endereco: true})
            alert('Coloque uma rua válida')
            return
        }
        if (bairro === '') {
            this.setState({erro_bairro: true})
            alert('Coloque um bairro válido')
            return
        }
        if (cidade === '') {
            this.setState({erro_cidade: true})
            alert('Coloque uma cidade válida')
            return
        }
        if (funcao.length === 0) {
            this.setState({erro_funcao: true})
            alert('Escolha uma função')
            return
        }
        if (!editando) {
            if (password.length < 4) {
                this.setState({erro_password: true})
                alert('senha muito fraca, mínimo 6 digitos')
                return
            }
            if (password !== re_password) {
                this.setState({erro_password: true})
                alert('senha diferentes')
                return
            }
        }

        //let status = this.status()
        let json_free = {
            status: '0',
            token: identificacao,
            nome: nome,
            email: email.trim(),
            nascimento: nascimento,
            telefone: telefone,
            cpf: cpf,
            rg: rg,
            indicacao: indicacao,
            docfotodata: (typeof docfoto === 'string') ? docfotodata : moment().format('DD-MM-YYYY HH:mm:ss'),
            docfoto: (docfoto !== '') ? (typeof docfoto === 'string') ? docfoto : await this.uploadImagem(`doc-${cpf}`, docfoto) : '',
            docfotostatus: 'Pendente',
            examefotodata: (typeof examefoto === 'string') ? examefotodata : moment().format('DD-MM-YYYY HH:mm:ss'),
            examefoto: (examefoto !== '') ? (typeof examefoto === 'string') ? examefoto : await this.uploadImagem(`exame-${cpf}`, examefoto) : '',
            examefotostatus: 'Pendente',
            certificadofotodata: (typeof certificadofoto === 'string') ? certificadofotodata : moment().format('DD-MM-YYYY HH:mm:ss'),
            certificadofoto: (certificadofoto !== '') ? (typeof certificadofoto === 'string') ? certificadofoto : await this.uploadImagem(`certificado-${cpf}`, certificadofoto) : '',
            certificadofotostatus: 'Pendente',
            facebook: facebook,
            instagram: instagram,
            twitter: twitter,
            rostofotodata: (typeof rostofoto === 'string') ? rostofotodata : moment().format('DD-MM-YYYY HH:mm:ss'),
            rostofoto: (rostofoto !== '') ? (typeof rostofoto === 'string') ? rostofoto : await this.uploadImagem(`rosto-${cpf}`, rostofoto) : '',
            rostofotostatus: 'Pendente',
            habilitacao: habilitacao,
            numero_carteira: numero_carteira,
            carroplaca: carroplaca,
            carromodelo: carromodelo,
            carrocor: carrocor,
            cep: cep,
            numero: numero,
            endereco: endereco,
            bairro: bairro,
            cidade: cidade,
            complemento: complemento,
            uniforme: uniforme,
            funcao: funcao,
            covidfotodata: (typeof covidfoto === 'string') ? covidfotodata : moment().format('DD-MM-YYYY HH:mm:ss'),
            covidfoto: (covidfoto !== '') ? (typeof covidfoto === 'string') ? covidfoto : await this.uploadImagem(`covid-${cpf}`, covidfoto) : '',
            covidfotostatus: 'Pendente',
            covid: covid,
            password: password
        }

        if (editando) {
            json_free.id = id
            delete json_free['status']
            delete json_free['password']
            this.setState({dialogCarregando: true, mensagemCarregando: 'Aguarde, enviando dados...'})
            const reposta_free = await requisicao(`${BASE_URL}/free`, {
                headers: {
                    token: process.env.REACT_APP_TOKEN,
                    tokenid: identificacao
                },
                method: 'put',
                body: JSON.stringify(json_free)
            })
            this.setState({dialogCarregando: false})
            if (reposta_free.sucesso) {
                localStorage.setItem(`ce:usuario-${identificacao}`, hideData(json_free))
                this.setState({
                    dialogAviso: true,
                    tituloAviso: 'Aviso',
                    mensagemAviso: 'Cadastro alterado com sucesso'
                })
            } else {
                this.setState({
                    dialogAviso: true,
                    tituloAviso: 'Aviso',
                    mensagemAviso: reposta_free.status
                })
            }
            this.props.history.push(`/admin/dashbord/?token=${identificacao}`)
        } else {
            this.setState({dialogCarregando: true, mensagemCarregando: 'Aguarde, enviando dados...'})
            const reposta_free = await requisicao(`${BASE_URL}/free/cadastro`, {
                headers: {
                    token: process.env.REACT_APP_TOKEN,
                    tokenid: identificacao
                },
                method: 'post',
                body: JSON.stringify(json_free)
            })
            this.setState({dialogCarregando: false})
            if (reposta_free.sucesso) {
                // this.setState({dialogCarregando: true, mensagemCarregando: 'Aguarde, enviando e-mail de validação...'})
                // let json_email = {
                //     to: email,
                //     subject: 'Verificação de conta',
                //     text: `Olá ${nome}`,
                //     html: this.html(`${window.location.href}&status=${status}`)
                // }
                // const resposta_email = await requisicao(`${BASE_URL}/mail`, {
                //     method: 'post',
                //     body: JSON.stringify(json_email)
                // })
                // if (resposta_email.sucesso) {
                //     this.setState({
                //         dialogCarregando: false,
                //         dialogAviso: true,
                //         tituloAviso: 'Aviso',
                //         mensagemAviso: 'Um link de verificação foi enviado para o e-mail cadastrado'
                //     })
                // } else {
                //     this.setState({
                //         dialogCarregando: false,
                //         dialogAviso: true,
                //         tituloAviso: 'Aviso',
                //         mensagemAviso: 'Falha ao envia e-mail de verificação'
                //     })
                // }
                localStorage.setItem(`ce:usuario-${identificacao}`, hideData(json_free))
                localStorage.setItem(`ce:login-${identificacao}`, 'ok')
                this.props.history.push(`/admin/dashbord/?token=${identificacao}`)
            } else {
                this.setState({
                    dialogCarregando: false,
                    dialogAviso: true,
                    tituloAviso: 'Aviso',
                    mensagemAviso: reposta_free.status
                })
            }
        }
    }

    status = () => {
        let date = new Date()
        return `${date.getTime()}`
    }

    html = link => {
        return `<html lang="pt-br">
                <head>
                    <meta charset="UTF-8">                                   
                </head>
                <body>                   
                    <div id="div-main">                                        
                        <a href="${link}">Clique aqui para verificar a conta</a>                                                                                                  
                    </div>                                
                </body>                            
                </html>`
    }

    abreLink = link => window.open(link)

    verificaFuncoes = async () => {
        const resposta_funcao = await requisicao(`${BASE_URL}/db/funcao/`, {
            headers: {
                token: process.env.REACT_APP_TOKEN,
                tokenid: identificacao
            },
            method: 'get'
        })
        let lista_funcao = []
        if (resposta_funcao) {
            resposta_funcao.dados.forEach(i => lista_funcao.push(i.nome))
        }
        this.setState({lista_funcao: lista_funcao})
    }

    verificaStatus = async () => {
        let query = this.props.history.location.search
        if (!query) return
        const {status} = searchEmJSON(query)
        if (status === undefined) return
        this.setState({dialogCarregando: true, mensagemCarregando: 'Aguarde, verificando conta...'})
        const resposta_status = await requisicao(`${BASE_URL}/free/verificaConta`, {
            headers: {
                token: process.env.REACT_APP_TOKEN,
                tokenid: identificacao
            },
            method: 'post',
            body: JSON.stringify({status: status})
        })
        if (resposta_status.sucesso) {
            localStorage.setItem(`ce:usuario-${identificacao}`, hideData(resposta_status.dados))
            localStorage.setItem(`ce:login-${identificacao}`, 'ok')
            this.props.history.push(`/admin/dashbord/?token=${identificacao}`)
            alert(resposta_status.status)
        } else {
            this.props.history.push(`/admin/login/?token=${identificacao}`)
        }
        this.setState({dialogCarregando: false})
    }

    usuario = () => {
        let usuario = localStorage.getItem(`ce:usuario-${identificacao}`)
        usuario = (usuario !== null) ? showData(usuario) : {}
        if (isEmptyObject(usuario)) return
        const {lista_covid, lista_uniforme, lista_habilitacao} = this.state
        this.setState(usuario)
        let index_covid = lista_covid.indexOf(usuario.covid)
        let index_uniforme = lista_uniforme.indexOf(usuario.uniforme)
        let index_habilicacao = lista_habilitacao.indexOf(usuario.habilitacao)
        this.setState({
            index_covid: index_covid,
            index_uniforme: index_uniforme,
            index_habilicacao: index_habilicacao,
            re_password: usuario.password,
            editando: true
        })
    }

    componentDidMount() {
        identificacao = token(this.props.location.search)
        this.verificaFuncoes()
        this.verificaStatus()
        this.usuario()
    }

    render() {
        const {
            email,
            nome,
            cpf,
            rg,
            indicacao,
            nascimento,
            cep,
            numero_carteira,
            carroplaca,
            complemento,
            carromodelo,
            carrocor,
            index_covid,
            index_habilicacao,
            index_uniforme,
            numero,
            endereco,
            bairro,
            cidade,
            password,
            re_password,
            telefone,
            lista_funcao,
            lista_covid,
            lista_habilitacao,
            lista_uniforme,
            dialogCarregando,
            mensagemCarregando,
            dialogAviso,
            tituloAviso,
            mensagemAviso,
            editando,
            docfoto,
            examefoto,
            certificadofoto,
            covidfoto,
            rostofoto,
            facebook,
            instagram,
            twitter,
            erro_nome,
            erro_email,
            erro_nascimento,
            erro_telefone,
            erro_cpf,
            erro_rg,
            erro_indicacao,
            erro_rostofoto,
            erro_docfoto,
            erro_carroplaca,
            erro_carromodelo,
            erro_carrocor,
            erro_cep,
            erro_numero,
            erro_endereco,
            erro_bairro,
            erro_cidade,
            erro_uniforme,
            erro_password
        } = this.state

        return (
            <div id="cadastro">
                <div id="div-cadastro">
                    <AppBar position="static">
                        <Toolbar variant="dense">
                            <IconButton edge="start" color="inherit" aria-label="menu" sx={{mr: 2}}>
                                <ArrowBack onClick={this.onClickVoltar}/>
                            </IconButton>
                            <Typography variant="h6" color="inherit" component="div">
                                Cadastro
                            </Typography>
                        </Toolbar>
                    </AppBar>
                    <div id="container-cadastro">
                        <Card>
                            <CardContent id="card-content-formulario">
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Dados pessoais</FormLabel>
                                </div>
                                <div id="div-formulario-cadastro-nome-email">
                                    <TextField error={erro_nome} variant="outlined" fullWidth={true}
                                               placeholder="Nome Completo"
                                               value={nome} name="nome" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField error={erro_email} variant="outlined" fullWidth={true}
                                               placeholder="E-mail"
                                               value={email} name="email" onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <TextField error={erro_nascimento} variant="outlined" fullWidth={true}
                                               placeholder="Data Nascimento"
                                               value={nascimento} name="nascimento" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField error={erro_telefone} variant="outlined" fullWidth={true}
                                               placeholder="Telefone"
                                               value={telefone} name="telefone" onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <TextField error={erro_cpf} variant="outlined" fullWidth={true} placeholder="CPF"
                                               value={cpf} name="cpf" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField error={erro_rg} variant="outlined" fullWidth={true} placeholder="RG"
                                               value={rg} name="rg" onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <TextField error={erro_indicacao} variant="outlined" fullWidth={true}
                                               placeholder="Indicado por"
                                               value={indicacao} name="indicacao" onChange={this.handleInputs}/>
                                </div>
                                <Box p={1}/>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Foto de perfil</FormLabel>
                                </div>
                                <div id="div-formulario-cadastro-covid">
                                    <div className="div-covid">
                                        <input type="file" accept="image/png, image/jpeg, application/pdf"
                                               required={erro_rostofoto} name="rostofoto" onChange={this.handleInputs}/>
                                        {
                                            ((typeof rostofoto === 'string') && rostofoto) &&
                                            <Box p={1}/>
                                        }
                                        {
                                            ((typeof rostofoto === 'string') && rostofoto) &&
                                            <FormLabel id="label-link" onClick={() => this.abreLink(rostofoto)}>
                                                Ver
                                            </FormLabel>
                                        }
                                    </div>
                                    <Box p={1}/>
                                    <div className="div-covid-1">
                                        <FormControl variant="outlined">
                                            <InputLabel id="demo-simple-select-label">Tamanho uniforme</InputLabel>
                                            <Select
                                                error={erro_uniforme}
                                                labelId="demo-simple-select-outlined-label"
                                                id="demo-simple-select-outlined"
                                                label="Tamanho uniforme"
                                                name="index_uniforme"
                                                onChange={this.handleInputs}
                                                value={index_uniforme}>
                                                {
                                                    lista_uniforme.map((i, index) => (
                                                        <MenuItem key={index} value={index}>{i}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                        <Box p={1}/>
                                    </div>
                                </div>
                                <Box p={1}/>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Foto do documento</FormLabel>
                                </div>

                                <div className="div-formulario-cadastro">
                                    <input type="file" accept="image/png, image/jpeg, application/pdf" name="docfoto"
                                           required={erro_docfoto} onChange={this.handleInputs}/>
                                    {
                                        ((typeof docfoto === 'string') && docfoto) &&
                                        <Box p={1}/>
                                    }
                                    {
                                        ((typeof docfoto === 'string') && docfoto) &&
                                        <FormLabel id="label-link" onClick={() => this.abreLink(docfoto)}>
                                            Ver
                                        </FormLabel>
                                    }
                                </div>
                                <Box p={1}/>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Foto do comprovante de vacinação</FormLabel>
                                </div>

                                <div id="div-formulario-cadastro-covid">
                                    <div className="div-covid">
                                        <input type="file" accept="image/png, image/jpeg, application/pdf"
                                               name="covidfoto"
                                               onChange={this.handleInputs}/>
                                        {
                                            ((typeof covidfoto === 'string') && covidfoto) &&
                                            <Box p={1}/>
                                        }
                                        {
                                            ((typeof covidfoto === 'string') && covidfoto) &&
                                            <FormLabel id="label-link" onClick={() => this.abreLink(covidfoto)}>
                                                Ver
                                            </FormLabel>
                                        }
                                    </div>
                                    <Box p={1}/>
                                    <div className="div-covid-1">
                                        <FormControl variant="outlined">
                                            <InputLabel id="demo-simple-select-label">Dose vacina</InputLabel>
                                            <Select
                                                labelId="demo-simple-select-outlined-label"
                                                id="demo-simple-select-outlined"
                                                label="Dose vacina"
                                                name="index_covid"
                                                onChange={this.handleInputs}
                                                value={index_covid}>
                                                {
                                                    lista_covid.map((i, index) => (
                                                        <MenuItem key={index} value={index}>{i}</MenuItem>
                                                    ))
                                                }
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                                <Box p={1}/>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Foto do exame médico</FormLabel>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <input type="file" accept="image/png, image/jpeg, application/pdf" name="examefoto"
                                           onChange={this.handleInputs}/>
                                    {
                                        ((typeof examefoto === 'string') && examefoto) &&
                                        <Box p={1}/>
                                    }
                                    {
                                        ((typeof examefoto === 'string') && examefoto) &&
                                        <FormLabel id="label-link" onClick={() => this.abreLink(examefoto)}>
                                            Ver
                                        </FormLabel>
                                    }
                                </div>
                                <Box p={1}/>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Foto do certificado</FormLabel>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <input type="file" accept="image/png, image/jpeg, application/pdf"
                                           name="certificadofoto"
                                           onChange={this.handleInputs}/>
                                    {
                                        ((typeof certificadofoto === 'string') && certificadofoto) &&
                                        <Box p={1}/>
                                    }
                                    {
                                        ((typeof certificadofoto === 'string') && certificadofoto) &&
                                        <FormLabel id="label-link" onClick={() => this.abreLink(certificadofoto)}>
                                            Ver
                                        </FormLabel>
                                    }
                                </div>
                                <Box p={1}/>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Redes sociais se possuir</FormLabel>
                                </div>
                                <div id="div-formulario-cadastro-rede-social">
                                    <TextField variant="outlined" fullWidth={true} placeholder="Facebook"
                                               value={facebook} name="facebook" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField variant="outlined" fullWidth={true} placeholder="Instagram"
                                               value={instagram} name="instagram" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField variant="outlined" fullWidth={true} placeholder="Twitter"
                                               value={twitter} name="twitter" onChange={this.handleInputs}/>
                                </div>
                                <Box p={1}/>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Dados da habilitação se possuir</FormLabel>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <FormControl variant="outlined" fullWidth={true}>
                                        <InputLabel id="demo-simple-select-label">Categoria carteira</InputLabel>
                                        <Select
                                            labelId="demo-simple-select-outlined-label"
                                            id="demo-simple-select-outlined"
                                            label="Categoria carteira"
                                            name="index_habilicacao"
                                            onChange={this.handleInputs}
                                            value={index_habilicacao}>
                                            {
                                                lista_habilitacao.map((i, index) => (
                                                    <MenuItem key={index} value={index}>{i}</MenuItem>
                                                ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <Box p={1}/>
                                    <TextField variant="outlined" fullWidth={true} placeholder="N° carteira"
                                               value={numero_carteira} name="numero_carteira"
                                               onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Dados do veículo se possuir</FormLabel>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <TextField error={erro_carroplaca} variant="outlined" fullWidth={true}
                                               placeholder="Placa"
                                               value={carroplaca} name="carroplaca" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField error={erro_carromodelo} variant="outlined" fullWidth={true}
                                               placeholder="Modelo"
                                               value={carromodelo} name="carromodelo" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField error={erro_carrocor} variant="outlined" fullWidth={true}
                                               placeholder="Cor"
                                               value={carrocor} name="carrocor" onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Endereço</FormLabel>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <TextField error={erro_cep} variant="outlined" fullWidth={true} placeholder="Cep"
                                               value={cep} name="cep" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField error={erro_numero} variant="outlined" placeholder="Nº"
                                               value={numero} name="numero" onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <TextField error={erro_endereco} variant="outlined" fullWidth={true}
                                               placeholder="Rua"
                                               value={endereco} name="endereco" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField error={erro_bairro} variant="outlined" fullWidth={true}
                                               placeholder="Bairro"
                                               value={bairro} name="bairro" onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <TextField error={erro_cidade} variant="outlined" fullWidth={true}
                                               placeholder="Cidade"
                                               value={cidade} name="cidade" onChange={this.handleInputs}/>
                                    <Box p={1}/>
                                    <TextField variant="outlined" fullWidth={true} placeholder="Complemento"
                                               value={complemento} name="complemento" onChange={this.handleInputs}/>
                                </div>
                                <div className="div-formulario-cadastro">
                                    <FormLabel>Dados da função</FormLabel>
                                </div>
                                <div className="div-funcao">
                                    {
                                        lista_funcao.map((i, index) => (
                                            <FormControlLabel key={index} control={<Check/>} label={i}
                                                              checked={this.checked(i)}
                                                              onChange={(e) => this.onCheckFuncao(i, e)}/>
                                        ))
                                    }
                                </div>
                                {
                                    !editando &&
                                    <div>
                                        <div className="div-formulario-cadastro">
                                            <FormLabel>Coloque um senha de acesso</FormLabel>
                                        </div>
                                        <div className="div-formulario-cadastro">
                                            <TextField error={erro_password} type="password" variant="outlined"
                                                       fullWidth={true}
                                                       placeholder="Senha"
                                                       value={password} name="password"
                                                       onChange={this.handleInputs}/>
                                            <Box p={1}/>
                                            <TextField error={erro_password} type="password" variant="outlined"
                                                       fullWidth={true}
                                                       placeholder="Confirma senha"
                                                       value={re_password} name="re_password"
                                                       onChange={this.handleInputs}/>
                                        </div>
                                    </div>
                                }
                                <div className="div-formulario-cadastro">
                                    <Button variant="outlined" fullWidth={true}
                                            onClick={this.onClickCadastrar}>{editando ? 'Alterar' : 'Cadastrar'}</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
                <Dialog open={dialogCarregando}>
                    <DialogContent id="dialog-carregando">
                        <CircularProgress size={30}/>
                        <DialogContentText id="label-carregando">{mensagemCarregando}</DialogContentText>
                    </DialogContent>
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
            </div>
        )
    }
}

export default Cadastro
