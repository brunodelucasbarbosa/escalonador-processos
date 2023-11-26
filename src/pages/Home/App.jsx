import { useEffect, useState } from 'react'
import SelecionarAlgoritmoProcesso from '../../components/SelecionarAlgoritmoProcesso';
import Trash from "../../assets/delete-symbol.svg";
import './app.css'

function App() {
  const [algoritmoEscalonador, setAlgoritmoEscalonador] = useState("FIFO");
  const [listaDeProcessos, setListaDeProcessos] = useState([])
  const [algoritmoEmExecucao, setAlgoritmoEmExecucao] = useState(false)
  let [filaProcessos, setFilaProcessos] = useState([])
  const [tempo, setTempo] = useState(0)
  const [memoria, setMemoria] = useState(
    Array.from({ length: 50 }, (_, index) => ({ numero: index + 1, emUso: false }))
  );
  
  const [processoEmExecucao, setProcessoEmExecucao] = useState([])
  const [quantum, setQuantum] = useState(0)
  const [sobrecarga, setSobrecarga] = useState(0)

  function adicionarProcesso() {
    const novaLista = [...listaDeProcessos, 
      {
        id: listaDeProcessos.length == 0 ? 0 : listaDeProcessos.slice(-1)[0].id + 1,
        tempoChegada: 0,
        deadline: 0,
        tempoExecucao: 0,
        vezesExecutado: 0,
        prioridade: 0,
        quantidadePaginas: 0,
        pages: [],
      }
    ]
    setListaDeProcessos(novaLista)
  }

  function editaProcesso(idProcesso, valor) {
    setListaDeProcessos(
      listaDeProcessos.map((p) =>
        p.id == idProcesso ? Object.assign(p, valor) : p
      )
    );
  }

  function excluirProcesso(idProcesso) {
    setListaDeProcessos(listaDeProcessos.filter((p) => p.id !== idProcesso))
  }

  function verificarSeFinalizou() {
    return listaDeProcessos.every((p) => p.vezesExecutado == p.tempoExecucao)
  }

useEffect(() => {
  if (verificarSeFinalizou()) setAlgoritmoEmExecucao(false)
  if(algoritmoEmExecucao) {
      let intervalo = setInterval( async () => {
          const tempoAtual = tempo;
          const resultado = listaDeProcessos.filter(
              processo => {
                  return processo.tempoChegada == tempoAtual
              }).map(
                  processo => processo.id
              );

          filaProcessos.push(...resultado)
          setFilaProcessos(filaProcessos)

          escalonarProcessos();
                
          //escalonarMemoria();
          setTempo(tempoAtual + 1)
      }, 1000)
      return () => clearInterval(intervalo)
  }
})

function escalonarMemoria() {
  if (filaProcessos.length == 0) return

  const processoAtual = listaDeProcessos.find(processo => processo.id === filaProcessos[0]);
  const paginasProcesso = processoAtual.paginas;

  // verifica se tem espaço na memoria
}

function escalonarProcessos() {
  if (filaProcessos.length == 0) {
    setProcessoEmExecucao([...processoEmExecucao, { processo: NaN, sobrecarga: 0, time: tempo },]);
    return;
  }

  if (algoritmoEscalonador == "FIFO") fifo();
  if (algoritmoEscalonador == "SJF") sjf();
  if (algoritmoEscalonador == "RR") roundRobin();
  if (algoritmoEscalonador == "EDF") edf();
}

function fifo() {
  executarProcessoTempoAtual();
}

function sjf() {
  filaProcessos.sort((a, b) => {
    const tempoExecucaoA = listaDeProcessos.find(processo => processo.id === a).tempoExecucao;
    const vezesExecutadoA = listaDeProcessos.find(processo => processo.id === a).vezesExecutado;
    const tempoExecucaoB =  listaDeProcessos.find(processo => processo.id === b).tempoExecucao;
    const vezesExecutadoB = listaDeProcessos.find(processo => processo.id === b).vezesExecutado;
    return (tempoExecucaoA - vezesExecutadoA) - (tempoExecucaoB - vezesExecutadoB);
  });

  setFilaProcessos(filaProcessos);
  executarProcessoTempoAtual();
}

function roundRobin() {
  if(processoEmExecucao.length >= quantum) {
    
    if(processoEmExecucao[processoEmExecucao.length -1].sobrecarga > 0) {

      if(processoEmExecucao[processoEmExecucao.length -1].sobrecarga < sobrecarga) {
        executarProcessoTempoAtual(processoEmExecucao[processoEmExecucao.length -1].sobrecarga + 1);

      } else {
        filaProcessos = [...filaProcessos.slice(1), filaProcessos[0]];
        setFilaProcessos(filaProcessos);
        executarProcessoTempoAtual();
      }

    } else if (processoEmExecucao.slice(-1 * quantum).every((p) => p.processo == filaProcessos[0])) {
      executarProcessoTempoAtual(1);
    } else {
      executarProcessoTempoAtual();
    }
  } else {
    executarProcessoTempoAtual();
  }
}

function edf() {
  if(processoEmExecucao.length >= quantum) {
    
    if(processoEmExecucao[processoEmExecucao.length -1].sobrecarga > 0) {
      
      if(processoEmExecucao[processoEmExecucao.length -1].sobrecarga < sobrecarga) {
        executarProcessoTempoAtual(processoEmExecucao[processoEmExecucao.length -1].sobrecarga + 1);
      } else {
        ordernarPorDeadline();
        executarProcessoTempoAtual();
      }

    } else if (processoEmExecucao.slice(-quantum).every((p) => p.processo == filaProcessos[0])) {
      executarProcessoTempoAtual(1);

    } else {
      executarProcessoTempoAtual();
    }

  } else {
      ordernarPorDeadline();
      executarProcessoTempoAtual();
  }
}

function ordernarPorDeadline() {
  filaProcessos.sort((a, b) => {
    return delistaDeProcessos.find(processo => processo.id === a).deadlineadlineA - 
    listaDeProcessos.find(processo => processo.id === b).deadline;
  });
  setFilaProcessos(filaProcessos);
}

function executarProcessoTempoAtual(sobrecarga = 0) {
  setProcessoEmExecucao([
    ...processoEmExecucao,
    { processo: filaProcessos[0], sobrecarga, time: tempo },
  ]);

  if (sobrecarga == 0) {
    setListaDeProcessos(
      listaDeProcessos.map((processo) => processo.id == filaProcessos[0] ?
       Object.assign(processo, {vezesExecutado:  processo.vezesExecutado+1}) : processo));

       const processoAtual = listaDeProcessos.find(processo => processo.id === filaProcessos[0])

       if (processoAtual && processoAtual.vezesExecutado == processoAtual.tempoExecucao) {
          setFilaProcessos(filaProcessos.slice(1))  //adiciona o ultimo elemento na fila de execucao
       }
  }
}

function montarCorExecucao(
  process,
  i) {

  if (process.id != processoEmExecucao[i].processo) return "";

  if (processoEmExecucao[i].sobrecarga > 0) return "bg-red-800";

  if (algoritmoEscalonador == "EDF" && processoEmExecucao[i].time >= process.tempoChegada + process.deadline) {
    return "bg-gray-500";
  }
  
  return "bg-green-800";
}


  return (
    <>
       <h1>
        Escalonador de processos
      </h1>

      <div className="selecionar_algoritmo">

      <h2 className='text-3xl'>Selecione o algoritmo:</h2>
        <SelecionarAlgoritmoProcesso
        algoritmoEmExecucao={algoritmoEmExecucao}
        algoritmoEscalonador={algoritmoEscalonador}
        setAlgoritmoEscalonador={setAlgoritmoEscalonador}
        processo={"FIFO"}/>

        <SelecionarAlgoritmoProcesso
        algoritmoEmExecucao={algoritmoEmExecucao}
        algoritmoEscalonador={algoritmoEscalonador}
        setAlgoritmoEscalonador={setAlgoritmoEscalonador}
        processo={"SJF"}/>

        <SelecionarAlgoritmoProcesso
        algoritmoEmExecucao={algoritmoEmExecucao}
        algoritmoEscalonador={algoritmoEscalonador}
        setAlgoritmoEscalonador={setAlgoritmoEscalonador}
        processo={"RR"}/>

        <SelecionarAlgoritmoProcesso
        algoritmoEmExecucao={algoritmoEmExecucao}
        algoritmoEscalonador={algoritmoEscalonador}
        setAlgoritmoEscalonador={setAlgoritmoEscalonador}
        processo={"EDF"}/>

        <label className="text-3xl">
          Quantum: 
          <input
            className='ml-5'
            disabled={algoritmoEmExecucao}
            type="number"
            onChange={(e) =>
              setQuantum(parseInt(e.target.value))
            }
            />
          <hr></hr>
        </label>

        <label className="text-3xl">
          Sobrecarga: 
          <input
            className='ml-5'
            disabled={algoritmoEmExecucao}
            type="number"
            onChange={(e) =>
              setSobrecarga(parseInt(e.target.value))
            }
            />
          <hr></hr>
        </label>
       </div>
      
      <div className="flex justify-center flex-row gap-1 m-5">
        <button className="adicionar_processos" onClick={adicionarProcesso}>
          <span>Adicionar processo</span>
        </button>

        <button className="iniciar_escalonamento" 
          onClick={() => setAlgoritmoEmExecucao(true)}>
          <span>Iniciar escalonamento</span>
        </button>
      </div>

<table className="table-process flex flex-col gap-10">
          <thead>
            <tr>
              <td className="process-info">Excluir</td>
              <td className="process-info">Id</td>
              <td className="process-info">Tempo Chegada</td>
              <td className="process-info">Tempo Execução</td>
              <td className="process-info">Deadline</td>
              <td className="process-info">Prioridade</td>
              <td className="process-info">Páginas</td>
            </tr>
          </thead>
          <tbody>
            {listaDeProcessos
              .sort((a, b) => a.id - b.id)
              .map((process, i) => (
                <tr key={i}>
                  <td
                    //style={{ cursor: runCpu ? "initial" : "pointer" }}
                    className="process-info"
                    onClick={() => !algoritmoEmExecucao && excluirProcesso(process.id)}>
                    <img src={Trash} alt="excluir processo" />
                  </td>
                  <td className="process-info">{process.id}</td>
                  <td className="process-info">
                    <input
                      disabled={algoritmoEmExecucao}
                      type="number"
                      value={process.tempoChegada}
                      className="w-full h-full text-center"
                      onChange={(e) =>
                        editaProcesso(process.id, {
                          tempoChegada: parseInt(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="process-info">
                    <input
                      disabled={algoritmoEmExecucao}
                      value={process.tempoExecucao}
                      type="number"
                      className="w-full h-full text-center"
                      onChange={(e) =>
                        editaProcesso(process.id, {
                          tempoExecucao: parseInt(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="process-info">
                    <input
                      disabled={algoritmoEmExecucao}
                      type="number"
                      value={process.deadline}
                      className="w-full h-full text-center"
                      onChange={(e) =>
                        editaProcesso(process.id, {
                          deadline: parseInt(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="process-info">
                    <input
                      disabled={algoritmoEmExecucao}
                      type="number"
                      value={process.prioridade}
                      className="w-full h-full text-center"
                      onChange={(e) =>
                        editaProcesso(process.id, {
                          prioridade: parseInt(e.target.value),
                        })
                      }
                    />
                  </td>
                  <td className="process-info">
                    <input
                      disabled={algoritmoEmExecucao}
                      type="number"
                      value={process.quantidadePaginas}
                      className="w-full h-full text-center"
                      onChange={(e) =>
                        editaProcesso(process.id, {
                          quantidadePaginas: parseInt(e.target.value),
                        })
                      }
                    />
                  </td>
                  {processoEmExecucao.map((_, i) => (
                    <td
                      key={`${i}-${i}`}
                      className={`${montarCorExecucao(
                        process,
                        i
                      )}`}
                    ></td>
                  ))}
                </tr>
              ))}
            <tr className="time">
              <td className="process-info processo_tempo">Tempo</td>
              {[...Array(tempo)].map((n, t) => (
                <td key={`time-${t}`}>{t}</td>
              ))}
            </tr>
          </tbody>
        </table>

        <h1>Memória RAM</h1>
        <div className="memory-container">
          <div className="ram">
          <div className="tabela">
            {memoria.map((m, i) => (
              <div key={i} className="ram">
                <span>{m.numero}</span>
              </div>
            ))}
            </div>
          </div>
        </div>
    </>
  )
}

export default App
