import {randomFillSync} from 'crypto'

const showData = (data) => {
    if (data) {
        data = data.split('').reverse().join('')
        data = decodeURIComponent(escape(atob(data)))
        data = JSON.parse(data)
        return data
    }
}

const hideData = (data) => {
    try {
        if (data) {
            data = JSON.stringify(data)
            data = btoa(unescape(encodeURIComponent(data)))
            data = data.split('').reverse().join('')
            return data
        }
    } catch (e) {

    }
}

const requisicao = async (url, conexao) => {
    return await fetch(url, conexao).then((data) => data.json()).catch((error) => (error))
}

const removeAcentos = texto => {
    texto = texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    texto = texto.toLowerCase()
    texto = texto.trim()
    return texto
}

const padronizacao = texto => {
    texto = texto.normalize("NFD").replace(/[^A-Z0-9]/ig, "")
    texto = texto.trim()
    return texto.toLowerCase()
}

const mascaraCpf = cpf => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/g, '\$1.\$2.\$3\-\$4')
}

const mascaraTelefone = telefone => {
    if (telefone !== '') {
        telefone = telefone.substring(0, 14)
        return telefone.replace(/\D/g, '').replace(/(\d{2})(\d)/, '($1) $2')
    }
}

const mascaraData = data => {
    data = data.substring(0, 10)
    let v = data.replace(/\D/g, '').slice(0, 10)
    if (v.length >= 5) {
        return `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`
    } else if (v.length >= 3) {
        return `${v.slice(0, 2)}/${v.slice(2)}`
    }
    return v
}

const validaCPF = cpf => {
    cpf = cpf.replace(/[^\d]+/g, '')
    if (cpf === '') return false
    if (cpf.length !== 11 ||
        cpf === "00000000000" ||
        cpf === "11111111111" ||
        cpf === "22222222222" ||
        cpf === "33333333333" ||
        cpf === "44444444444" ||
        cpf === "55555555555" ||
        cpf === "66666666666" ||
        cpf === "77777777777" ||
        cpf === "88888888888" ||
        cpf === "99999999999")
        return false
    let add = 0
    let rev
    for (let i = 0; i < 9; i++)
        add += parseInt(cpf.charAt(i)) * (10 - i)
    rev = 11 - (add % 11)
    if (rev === 10 || rev === 11)
        rev = 0
    if (rev !== parseInt(cpf.charAt(9)))
        return false
    add = 0
    for (let i = 0; i < 10; i++)
        add += parseInt(cpf.charAt(i)) * (11 - i)
    rev = 11 - (add % 11)
    if (rev === 10 || rev === 11)
        rev = 0
    if (rev !== parseInt(cpf.charAt(10)))
        return false
    return true
}

const chave = () => {
    let wishlist = '0123456789'
    return Array.from(randomFillSync(new Uint8Array(15))).map((x) => wishlist[x % wishlist.length]).join('')
}

const idPedido = () => {
    let wishlist = 'qwertyuioplkjhgfdsazxcvbnmQWERTYUIOPLKJHGFDSAZXCVBNM'
    let a = Array.from(randomFillSync(new Uint8Array(5))).map((x) => wishlist[x % wishlist.length]).join('')
    let date = new Date()
    let b = date.getTime()
    return `${a}${b}`
}

const simplificaIdPedido = id_pedido => {
    return `#${id_pedido.substring(id_pedido.length - 5)}`
}

const mostraDados = dados => {
    if (dados) {
        dados = dados.split('').reverse().join('')
        dados = atob(dados)
        return JSON.parse(dados)
    }
}

const escondeDados = dados => {
    if (dados) {
        dados = JSON.stringify(dados)
        dados = btoa(unescape(encodeURIComponent(dados)))
        dados = dados.split('').reverse().join('')
        return dados
    }
}

const searchEmJSON = search => {
    let pairs = search.substring(1).split('&'), objeto = {}, pair, i;
    for (i in pairs) {
        if (pairs[i] === '') continue
        pair = pairs[i].split('=')
        objeto[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1])
    }
    return objeto
}

const rolagem = (id, tempoDeRolagem) => {
    try {
        let target = document.getElementById(id)
        let elem = document.scrollingElement || document.documentElement
        let style = 'scrollTop'
        let unit = ''
        let from = window.scrollY
        let prop = true
        let to = (target.offsetTop - 70)
        if (!elem) return
        var start = new Date().getTime(),
            timer = setInterval(function () {
                var step = Math.min(1, (new Date().getTime() - start) / tempoDeRolagem)
                if (prop) {
                    elem[style] = (from + step * (to - from)) + unit
                } else {
                    elem.style[style] = (from + step * (to - from)) + unit
                }
                if (step === 1) {
                    clearInterval(timer)
                }
            }, 25);
        if (prop) {
            elem[style] = from + unit
        } else {
            elem.style[style] = from + unit
        }
    } catch (e) {

    }
}

const isEmptyObject = (objeto) => {
    return (Object.keys(objeto).length === 0)
}

const converteNumeroWhatsApp = numero => {
    if (numero === '') return
    numero = numero.substring(1)
    numero = numero.split(')')
    return `${numero[0]}${numero[1].substring(2)}`
}

const expiracao = () => {
    let date = new Date()
    date.setHours(date.getHours() + 2)
    return date.getTime()
}

const token = search => {
    try {
        if (search === '') return window.location.href = '/'
        const {token} = searchEmJSON(search)
        return token
    } catch (e) {
        alert('token\n' + e)
    }
}

const capitalize = string => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

//const BASE_URL = 'http://localhost:3101/evento'
const BASE_URL = 'https://simoneveraneio.com.br/evento'

const mobile = () => {
    let check = false;
    ((a) => {
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true
    })(navigator.userAgent || navigator.vendor || window.opera)
    return check
}

const isDebug = () => {
    try {
        return (window.location.host === 'localhost:3000')
    } catch (e) {

    }
}

export {
    showData,
    hideData,
    requisicao,
    removeAcentos,
    padronizacao,
    mascaraCpf,
    mascaraTelefone,
    mascaraData,
    validaCPF,
    chave,
    idPedido,
    simplificaIdPedido,
    mostraDados,
    escondeDados,
    searchEmJSON,
    rolagem,
    isEmptyObject,
    converteNumeroWhatsApp,
    expiracao,
    token,
    capitalize,
    BASE_URL,
    mobile,
    isDebug
}
