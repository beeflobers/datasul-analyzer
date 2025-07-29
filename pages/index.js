// pages/index.js
import React, { useState } from 'react';
import { Search, BookOpen, Clock, Tag, AlertCircle, Upload, X, Image, FileText, File } from 'lucide-react';

const DatasulRoutineAnalyzer = () => {
  const [routineCode, setRoutineCode] = useState('');
  const [context, setContext] = useState('');
  const [systemChanges, setSystemChanges] = useState('');
  const [datasulVersion, setDatasulVersion] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [specificQuestion, setSpecificQuestion] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [history, setHistory] = useState([]);
  const [knowledgeBase, setKnowledgeBase] = useState([]);

  const getFileIcon = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return <Image size={16} className="text-blue-500" />;
    } else if (['pdf'].includes(extension)) {
      return <FileText size={16} className="text-red-500" />;
    } else if (['doc', 'docx'].includes(extension)) {
      return <FileText size={16} className="text-blue-600" />;
    } else if (['txt'].includes(extension)) {
      return <FileText size={16} className="text-gray-500" />;
    } else if (['csv', 'xls', 'xlsx'].includes(extension)) {
      return <FileText size={16} className="text-green-600" />;
    } else {
      return <File size={16} className="text-gray-400" />;
    }
  };

  const getFileTypeLabel = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'Imagem';
    } else if (['pdf'].includes(extension)) {
      return 'PDF';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'Word';
    } else if (['txt'].includes(extension)) {
      return 'Texto';
    } else if (['csv'].includes(extension)) {
      return 'CSV';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'Excel';
    } else {
      return 'Arquivo';
    }
  };

  const processFileContent = async (file, arrayBuffer) => {
    const extension = file.name.split('.').pop().toLowerCase();
    
    try {
      if (extension === 'pdf') {
        const text = `[ARQUIVO PDF: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]
        
IMPORTANTE: Este é um arquivo PDF que contém informações relevantes para a análise da rotina.
O usuário anexou este documento para fornecer contexto adicional.

Sugestões para o usuário:
- Descreva o conteúdo principal do PDF no campo "Contexto Adicional"
- Mencione se contém procedimentos, configurações ou documentação específica
- Indique se há códigos de erro, mensagens ou campos relevantes`;
        
        return text;
      } else if (extension === 'docx') {
        return `[DOCUMENTO WORD: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]

💡 SOLUÇÃO MANUAL:
1. Abra o documento Word
2. Copie o conteúdo relevante
3. Cole no campo "Contexto Adicional" abaixo
4. Mencione informações específicas como números, códigos, procedimentos`;
        
      } else if (['xls', 'xlsx'].includes(extension)) {
        return `[PLANILHA EXCEL: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]

💡 SOLUÇÃO MANUAL:
1. Abra a planilha Excel
2. Identifique dados relevantes (colunas, valores, totais)
3. Descreva no campo "Contexto Adicional":
   - Cabeçalhos das colunas
   - Exemplos de dados
   - Totais ou resumos importantes`;
      }
    } catch (error) {
      console.error('💥 ERRO GERAL no processamento:', error);
      return `[ARQUIVO: ${file.name}]

Erro geral no processamento: ${error.message}
Por favor, descreva o conteúdo relevante no campo "Contexto Adicional".`;
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
        'application/pdf',
        'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      const extension = file.name.split('.').pop().toLowerCase();
      const isAllowed = allowedTypes.includes(file.type) || 
        ['doc', 'docx', 'pdf', 'txt', 'csv', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
      
      if (!isAllowed) {
        alert(`Tipo de arquivo não suportado: ${file.name}`);
        continue;
      }
      
      if (file.size > 50 * 1024 * 1024) {
        alert(`Arquivo ${file.name} é muito grande. Máximo permitido: 50MB`);
        continue;
      }
      
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension);
      
      if (isImage) {
        reader.onload = (e) => {
          const newFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: e.target.result,
            file: file,
            isImage: true,
            processedContent: `[IMAGEM: ${file.name}]

Esta é uma imagem anexada que pode conter:
- Screenshot de tela do Datasul
- Diagrama ou fluxo de processo
- Mensagem de erro
- Documentação visual

IMPORTANTE: Para melhor análise, descreva o que você vê nesta imagem no campo "Contexto Adicional".
Exemplo: "Tela mostra erro X no campo Y" ou "Screenshot da rotina ABC com campos preenchidos"`
          };
          setUploadedFiles(prev => [...prev, newFile]);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = async (e) => {
          let processedContent = '';
          
          if (file.type === 'text/plain' || file.type === 'text/csv' || extension === 'txt' || extension === 'csv') {
            processedContent = typeof e.target.result === 'string' ? e.target.result : new TextDecoder().decode(e.target.result);
          } else {
            processedContent = await processFileContent(file, e.target.result);
          }
          
          const newFile = {
            id: Date.now() + Math.random(),
            name: file.name,
            type: file.type,
            size: file.size,
            content: e.target.result,
            processedContent: processedContent,
            file: file,
            isImage: false
          };
          setUploadedFiles(prev => [...prev, newFile]);
        };
        
        if (file.type === 'text/plain' || file.type === 'text/csv') {
          reader.readAsText(file);
        } else {
          reader.readAsArrayBuffer(file);
        }
      }
    }
    
    event.target.value = '';
  };

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const analyzeRoutine = async () => {
    if (!routineCode.trim()) {
      alert('Por favor, insira o código ou nome da rotina');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      let attachmentContext = '';
      if (uploadedFiles.length > 0) {
        const fileTypes = uploadedFiles.map(file => getFileTypeLabel(file.name));
        const uniqueTypes = [...new Set(fileTypes)];
        attachmentContext = `\nANEXOS ANALISADOS: ${uploadedFiles.length} arquivo(s) processado(s) - Tipos: ${uniqueTypes.join(', ')}`;
        
        attachmentContext += '\n\nCONTEUDO DOS ANEXOS PARA ANÁLISE:';
        
        uploadedFiles.forEach(file => {
          const fileSizeMB = (file.size / (1024 * 1024)).toFixed(1);
          const sizeLabel = file.size > 1024 * 1024 ? `${fileSizeMB} MB` : `${(file.size / 1024).toFixed(1)} KB`;
          
          attachmentContext += `\n\n=== ${file.name} (${getFileTypeLabel(file.name)}, ${sizeLabel}) ===`;
          
          if (file.processedContent) {
            const maxContentLength = file.size > 5 * 1024 * 1024 ? 5000 : 8000;
            const content = file.processedContent.substring(0, maxContentLength);
            const isTruncated = file.processedContent.length > maxContentLength;
            
            attachmentContext += `\n${content}${isTruncated ? '\n\n[CONTEÚDO TRUNCADO PARA OTIMIZAÇÃO - PRINCIPAIS INFORMAÇÕES PRESERVADAS]' : ''}`;
          } else if (file.content && typeof file.content === 'string') {
            const maxContentLength = file.size > 5 * 1024 * 1024 ? 5000 : 8000;
            const content = file.content.substring(0, maxContentLength);
            const isTruncated = file.content.length > maxContentLength;
            
            attachmentContext += `\n${content}${isTruncated ? '\n\n[ARQUIVO TRUNCADO PARA OTIMIZAÇÃO]' : ''}`;
          }
        });
        
        attachmentContext += `\n\nINSTRUÇÃO IMPORTANTE: Use todas as informações dos anexos acima para enriquecer a análise da rotina.`;
      }
      
      let changesContext = '';
      if (systemChanges.trim()) {
        changesContext = `\nMUDANCAS NO SISTEMA: ${systemChanges.trim()}`;
      }
      
      let environmentContext = '';
      if (datasulVersion.trim()) {
        environmentContext = `\nAMBIENTE: Versao Datasul: ${datasulVersion}`;
      }
      
      let questionContext = '';
      if (specificQuestion.trim()) {
        questionContext = `\nPERGUNTA ESPECIFICA DO USUARIO: "${specificQuestion.trim()}"
        
IMPORTANTE: Alem da analise geral da rotina, de atencao especial para responder esta pergunta especifica do usuario.`;
      }
      
      let knowledgeContext = '';
      if (knowledgeBase.length > 0) {
        const relatedRoutines = knowledgeBase.filter(kb => 
          kb.modulo === knowledgeBase.find(k => k.codigo_rotina.toLowerCase().includes(routineCode.toLowerCase()))?.modulo ||
          kb.codigo_rotina.toLowerCase().includes(routineCode.toLowerCase()) ||
          kb.integracoes.some(integ => integ.toLowerCase().includes(routineCode.toLowerCase()))
        );
        
        if (relatedRoutines.length > 0) {
          knowledgeContext = `\n\nBASE DE CONHECIMENTO - ROTINAS RELACIONADAS PREVIAMENTE ANALISADAS:
${relatedRoutines.map(kb => `
- ${kb.codigo_rotina} (${kb.modulo}): ${kb.finalidade_detalhada}
  Integracoes: ${kb.integracoes.join(', ')}
  Validacoes: ${kb.validacoes_importantes.join(', ')}
  Quando usar: ${kb.quando_usar}
`).join('')}

UTILIZE ESTAS INFORMACOES PARA melhorar a precisao da analise.`;
        }
      }
      
      const prompt = `Analise a rotina Datasul: ${routineCode}

CONTEXTO: ${context || 'Nenhum'}${attachmentContext}${changesContext}${environmentContext}${questionContext}

Responda apenas com JSON (sem backticks):
{
  "codigo_rotina": "codigo da rotina",
  "nome_completo": "nome completo",
  "finalidade_detalhada": "o que faz especificamente",
  "modulo": "modulo do Datasul",
  "categoria": "tipo da rotina",
  "quando_usar": "quando usar",
  "validacoes_importantes": ["validacao1", "validacao2"],
  "integracoes": ["rotina1", "rotina2"],
  "exemplos_praticos": ["exemplo1", "exemplo2"],
  "impacto_sistema": "impacto no sistema",
  "frequencia_uso": "frequencia",
  "perfil_usuario": "tipo de usuario",
  "nivel_confianca": "ALTO ou MEDIO ou BAIXO",
  "pontos_verificar": "pontos a verificar",
  "limitacoes_analise": "limitacoes"
}`;

      // ✅ MUDANÇA PRINCIPAL: Chama nossa API route em vez de window.claude.complete
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na requisição da API');
      }

      const data = await response.json();
      const claudeResponse = data.response;
      
      console.log('Resposta bruta recebida:', claudeResponse);
      
      // Limpar a resposta removendo backticks markdown se existirem
      let cleanResponse = claudeResponse.trim();
      if (cleanResponse.startsWith('```json')) {
        cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanResponse.startsWith('```')) {
        cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      console.log('Resposta limpa:', cleanResponse);
      
      let result;
      try {
        result = JSON.parse(cleanResponse);
      } catch (parseError) {
        console.error('Erro no parse JSON:', parseError);
        console.error('Conteúdo que falhou:', cleanResponse);
        throw new Error('Falha ao processar resposta da análise. Tente novamente.');
      }
      
      setAnalysis(result);
      
      // Salvar no knowledge base e histórico
      const knowledgeEntry = {
        codigo_rotina: result.codigo_rotina,
        nome_completo: result.nome_completo,
        finalidade_detalhada: result.finalidade_detalhada,
        modulo: result.modulo,
        categoria: result.categoria,
        quando_usar: result.quando_usar,
        validacoes_importantes: result.validacoes_importantes,
        integracoes: result.integracoes,
        exemplos_praticos: result.exemplos_praticos,
        impacto_sistema: result.impacto_sistema,
        frequencia_uso: result.frequencia_uso,
        perfil_usuario: result.perfil_usuario,
        nivel_confianca: result.nivel_confianca,
        datasul_version: datasulVersion || 'Nao especificada',
        analyzed_date: new Date().toISOString(),
        context_provided: context || '',
        system_changes: systemChanges || '',
        specific_question: specificQuestion || ''
      };
      
      const existingIndex = knowledgeBase.findIndex(kb => 
        kb.codigo_rotina.toLowerCase() === result.codigo_rotina.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        setKnowledgeBase(prev => {
          const updated = [...prev];
          updated[existingIndex] = knowledgeEntry;
          return updated;
        });
      } else {
        setKnowledgeBase(prev => [...prev, knowledgeEntry]);
      }
      
      const newEntry = {
        id: Date.now(),
        routineCode,
        context: context || 'Sem contexto',
        systemChanges: systemChanges || 'Nenhuma mudanca informada',
        datasulVersion: datasulVersion || 'Nao informada',
        specificQuestion: specificQuestion || 'Nenhuma pergunta especifica',
        attachments: uploadedFiles.map(file => ({ 
          name: file.name, 
          type: getFileTypeLabel(file.name),
          size: file.size,
          url: file.url || null,
          isImage: file.isImage || false,
          wasProcessed: !!file.processedContent
        })),
        analysis: result,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Erro completo ao analisar rotina:', error);
      
      if (error.message.includes('Falha ao processar resposta')) {
        alert('Erro ao processar a resposta da análise. A API pode ter retornado um formato inesperado. Tente novamente.');
      } else if (error.message.includes('JSON')) {
        alert('Erro no formato da resposta. Tente novamente com um prompt mais simples.');
      } else {
        alert(`Erro ao analisar a rotina: ${error.message}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadFromHistory = (entry) => {
    setRoutineCode(entry.routineCode);
    setContext(entry.context === 'Sem contexto' ? '' : entry.context);
    setSystemChanges(entry.systemChanges === 'Nenhuma mudanca informada' ? '' : entry.systemChanges);
    setDatasulVersion(entry.datasulVersion === 'Nao informada' ? '' : entry.datasulVersion);
    setSpecificQuestion(entry.specificQuestion === 'Nenhuma pergunta especifica' ? '' : entry.specificQuestion);
    
    const recreatedFiles = (entry.attachments || []).map(att => ({
      id: Date.now() + Math.random(),
      name: att.name,
      type: att.type,
      size: att.size,
      url: att.url,
      isImage: att.isImage,
      wasProcessed: att.wasProcessed,
      processedContent: att.wasProcessed ? `[ARQUIVO DO HISTÓRICO: ${att.name}]

Este arquivo foi processado em uma análise anterior. 
Para nova análise com este arquivo, faça upload novamente.` : null
    }));
    
    setUploadedFiles(recreatedFiles);
    setAnalysis(entry.analysis);
  };

  const getModuleColor = (module) => {
    const colors = {
      'Financeiro': 'bg-green-100 text-green-800',
      'Faturamento': 'bg-blue-100 text-blue-800',
      'Compras': 'bg-purple-100 text-purple-800',
      'Producao': 'bg-orange-100 text-orange-800',
      'Contabilidade': 'bg-indigo-100 text-indigo-800',
      'Estoque': 'bg-yellow-100 text-yellow-800',
      'Vendas': 'bg-pink-100 text-pink-800'
    };
    return colors[module] || 'bg-gray-100 text-gray-800';
  };

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
                  className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
