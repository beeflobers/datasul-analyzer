// pages/index.js
import React from 'react';
import { Search, BookOpen, Clock, Tag, AlertCircle, Upload, X, Image, FileText, File } from 'lucide-react'
import { useAnalyzer } from '../src/hooks/useAnalyzer'
import { getFileIcon, getFileTypeLabel, getModuleColor } from '../src/utils/datasulHelpers'


const DatasulRoutineAnalyzer = () => {
  const {
    routineCode, setRoutineCode,
    context, setContext,
    systemChanges, setSystemChanges,
    datasulVersion, setDatasulVersion,
    uploadedFiles,
    specificQuestion, setSpecificQuestion,
    analysis,
    isAnalyzing,
    history,
    handleFileUpload,
    removeFile,
    analyzeRoutine,
    loadFromHistory
  } = useAnalyzer();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Analisador de Rotinas Datasul
        </h1>
        <p className="text-gray-600">
          Descubra a finalidade e uso pratico das rotinas do sistema Datasul
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Search className="mr-2" size={20} />
              Analisar Rotina
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versao do Datasul
                </label>
                <input
                  type="text"
                  value={datasulVersion}
                  onChange={(e) => setDatasulVersion(e.target.value)}
                  placeholder="Versao do Datasul (ex: 12.1.33)"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <p className="text-xs text-blue-600 mt-1">
                  Esta informacao ajuda a dar respostas mais especificas para seu ambiente
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Codigo ou Nome da Rotina
                </label>
                <input
                  type="text"
                  value={routineCode}
                  onChange={(e) => setRoutineCode(e.target.value)}
                  placeholder="Ex: ESP001, Manutencao de Clientes, etc."
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contexto Adicional (Opcional)
                </label>
                <textarea
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  placeholder="Descreva o que voce ve na tela, campos disponiveis, ou qualquer informacao adicional..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pergunta Especifica sobre a Rotina (Opcional)
                </label>
                <textarea
                  value={specificQuestion}
                  onChange={(e) => setSpecificQuestion(e.target.value)}
                  placeholder="Faca uma pergunta especifica sobre esta rotina. Ex: 'Como configurar parametros?', 'Quais campos sao obrigatorios?', 'Como resolver erro X?', etc."
                  rows={3}
                  className="w-full p-3 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-purple-50"
                />
                <p className="text-xs text-purple-600 mt-1">
                  Sua pergunta sera respondida de forma integrada na analise da rotina
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mudancas Realizadas no Sistema
                </label>
                <textarea
                  value={systemChanges}
                  onChange={(e) => setSystemChanges(e.target.value)}
                  placeholder="Descreva mudancas recentes: novas versoes, patches, customizacoes, novos campos, alteracoes de comportamento, etc."
                  rows={3}
                  className="w-full p-3 border border-orange-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-orange-50"
                />
                <p className="text-xs text-orange-600 mt-1">
                  Essas informacoes ajudam a identificar se a rotina foi afetada por mudancas recentes
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexos - Processamento Inteligente 🧠
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-md p-4 hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    id="fileUpload"
                    multiple
                    accept=".jpg,.jpeg,.png,.gif,.bmp,.webp,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="fileUpload"
                    className="cursor-pointer flex flex-col items-center justify-center text-gray-500 hover:text-gray-700"
                  >
                    <Upload className="mb-2" size={32} />
                    <span className="text-sm font-medium">Clique para anexar arquivos que serão analisados</span>
                    <span className="text-xs text-gray-400 mt-1">
                      Processamos: Imagens, PDF, Word, Excel, CSV, TXT até 50MB
                    </span>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Arquivos anexados e processados:</h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border group hover:bg-gray-100">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            {getFileIcon(file.name)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {file.name}
                                </p>
                                {file.processedContent && (
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    ✓ Processado
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-500">
                                {getFileTypeLabel(file.name)} • {
                                  file.size > 1024 * 1024 
                                    ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
                                    : `${(file.size / 1024).toFixed(1)} KB`
                                }
                              </p>
                            </div>
                            {file.isImage && file.url && (
                              <img
                                src={file.url}
                                alt={file.name}
                                className="w-12 h-12 object-cover rounded border"
                              />
                            )}
                          </div>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="ml-3 p-1 text-red-500 hover:text-red-700 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={analyzeRoutine}
                disabled={isAnalyzing}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? 'Analisando...' : 'Analisar Rotina'}
              </button>
            </div>
          </div>

          {analysis && (
            <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BookOpen className="mr-2" size={20} />
                Analise Detalhada da Rotina
              </h3>
              
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-bold text-gray-900">
                      {analysis.codigo_rotina} - {analysis.nome_completo}
                    </h4>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getModuleColor(analysis.modulo)}`}>
                        {analysis.modulo}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {analysis.categoria}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        analysis.nivel_confianca === 'ALTO' ? 'bg-green-100 text-green-800' :
                        analysis.nivel_confianca === 'MEDIO' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        Confianca: {analysis.nivel_confianca}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Frequencia:</strong> {analysis.frequencia_uso} | <strong>Usuario:</strong> {analysis.perfil_usuario}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Tag className="mr-2" size={16} />
                    Finalidade Detalhada:
                  </h4>
                  <p className="text-gray-700 bg-blue-50 p-3 rounded-md">{analysis.finalidade_detalhada}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Quando Usar:</h4>
                  <p className="text-gray-700 bg-green-50 p-3 rounded-md text-sm">{analysis.quando_usar}</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Validacoes Importantes:</h4>
                    <div className="space-y-1">
                      {analysis.validacoes_importantes.map((validacao, index) => (
                        <span key={index} className="block px-3 py-1 bg-yellow-50 text-yellow-800 rounded text-sm">
                          • {validacao}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Integracoes:</h4>
                    <div className="space-y-1">
                      {analysis.integracoes.map((integracao, index) => (
                        <span key={index} className="block px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                          → {integracao}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Exemplos Praticos:</h4>
                  <div className="bg-green-50 p-4 rounded-md">
                    <ul className="space-y-2">
                      {analysis.exemplos_praticos.map((exemplo, index) => (
                        <li key={index} className="text-green-800 text-sm">
                          <strong>{index + 1}.</strong> {exemplo}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-md p-4">
                    <h4 className="font-semibold text-indigo-900 mb-2">Impacto no Sistema:</h4>
                    <p className="text-indigo-800 text-sm">{analysis.impacto_sistema}</p>
                  </div>
                  
                  {analysis.impacto_mudancas && (
                    <div className="bg-purple-50 border border-purple-200 rounded-md p-4">
                      <h4 className="font-semibold text-purple-900 mb-2">Impacto das Mudancas do Sistema:</h4>
                      <p className="text-purple-800 text-sm">{analysis.impacto_mudancas}</p>
                    </div>
                  )}
                  
                  {analysis.recomendacoes_pos_mudanca && (
                    <div className="bg-teal-50 border border-teal-200 rounded-md p-4">
                      <h4 className="font-semibold text-teal-900 mb-2">Recomendacoes Pos-Mudanca:</h4>
                      <p className="text-teal-800 text-sm">{analysis.recomendacoes_pos_mudanca}</p>
                    </div>
                  )}
                  
                  {analysis.resposta_pergunta_especifica && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-md p-4">
                      <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                        Resposta a Sua Pergunta:
                      </h4>
                      <p className="text-purple-800 text-sm font-medium">{analysis.resposta_pergunta_especifica}</p>
                    </div>
                  )}
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <AlertCircle className="mr-2" size={16} />
                    Confiabilidade da Analise
                  </h4>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Pontos a Verificar no Sistema:</h5>
                      <div className="space-y-1">
                        {typeof analysis.pontos_verificar === 'string' ? (
                          <p className="text-sm text-gray-700">{analysis.pontos_verificar}</p>
                        ) : (
                          analysis.pontos_verificar.map((ponto, index) => (
                            <div key={index} className="text-sm text-gray-700 flex items-start">
                              <span className="text-blue-500 mr-2">•</span>
                              {ponto}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-gray-800 mb-2">Limitacoes desta Analise:</h5>
                      <p className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                        {analysis.limitacoes_analise}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                    <p className="text-sm text-blue-800">
                      <strong>Recomendacao:</strong> Use esta analise como ponto de partida. 
                      Sempre teste e valide no seu ambiente antes de implementar mudancas importantes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <Clock className="mr-2" size={20} />
            Historico
          </h3>
          
          {history.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Nenhuma analise realizada ainda
            </p>
          ) : (
            <div className="space-y-3">
              {history.map((entry) => (
                <div
                  key={entry.id}
                  className="border border-gray-200 rounded-md p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => loadFromHistory(entry)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm truncate">
                      {entry.routineCode}
                    </span>
                    <div className="flex items-center gap-1">
                      {entry.attachments && entry.attachments.length > 0 && (
                        <div className="flex items-center gap-1">
                          {entry.attachments.some(att => att.isImage) && (
                            <Image size={12} className="text-blue-500" />
                          )}
                          {entry.attachments.some(att => !att.isImage) && (
                            <FileText size={12} className="text-green-500" />
                          )}
                          <span className="text-xs text-gray-500">
                            {entry.attachments.length}
                          </span>
                          {entry.attachments.some(att => att.wasProcessed) && (
                            <span className="text-xs text-green-600 font-medium">✓</span>
                          )}
                        </div>
                      )}
                      <span className={`px-2 py-1 rounded text-xs ${getModuleColor(entry.analysis.modulo)}`}>
                        {entry.analysis.modulo}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.analysis.nivel_confianca === 'ALTO' ? 'bg-green-100 text-green-700' :
                        entry.analysis.nivel_confianca === 'MEDIO' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {entry.analysis.nivel_confianca}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-1">
                    {entry.timestamp}
                  </p>
                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                    {entry.systemChanges !== 'Nenhuma mudanca informada' && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                        Mudancas
                      </span>
                    )}
                    {entry.specificQuestion !== 'Nenhuma pergunta especifica' && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        Pergunta
                      </span>
                    )}
                    {entry.attachments && entry.attachments.length > 0 && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                        {entry.attachments.length} anexo(s)
                        {entry.attachments.some(att => att.wasProcessed) && (
                          <span className="text-green-600 ml-1">✓ processados</span>
                        )}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 truncate">
                    {entry.specificQuestion !== 'Nenhuma pergunta especifica' 
                      ? `${entry.specificQuestion}` 
                      : entry.analysis.finalidade_detalhada}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasulRoutineAnalyzer;
