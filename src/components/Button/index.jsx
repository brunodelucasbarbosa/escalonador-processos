import './styles.css'

export default function Button(textoBotao) {
    return (
        <button className='button_component'>
            {textoBotao}
        </button>
    )
}