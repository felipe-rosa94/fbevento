import {isDebug} from '../util'

const Cache = props => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.href = `${isDebug() ? 'http://localhost:3000' : 'https://fbevento.com.br'}/admin/login/${props.location.search}`
    return (<div/>)
}

export default Cache
