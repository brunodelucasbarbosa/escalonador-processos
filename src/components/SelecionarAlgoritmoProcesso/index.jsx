function SelecionarAlgoritmoProcesso(
  {algoritmoEscalonador, 
  setAlgoritmoEscalonador,
  processo,
  algoritmoEmExecucao}) {

    return(
      <div className="p-2">
        <label className="text-3xl m-4">
          {processo}
          <input
          className="m-2"
            disabled={algoritmoEmExecucao}
            type="checkbox"
            checked={algoritmoEscalonador == processo}
            onChange={(e) =>
              e.target.checked && setAlgoritmoEscalonador(processo)
            }
            />
          <hr></hr>
        </label>
            </div>
    )
}

export default SelecionarAlgoritmoProcesso