// src/hooks/useAnalyzer.js
import { useState } from 'react';
import { getFileTypeLabel } from '../utils/datasulHelpers';
import mammoth from 'mammoth'
import * as XLSX from '@e965/xlsx'

export const useAnalyzer = () => {
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

const extrairPDF = async(arrayBuffer) => {
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.mjs`
 

  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items.map(item => item.str).join(' ');
    text += `\n[Página ${i}]\n${pageText}`;
  }
  return text

  }

  const processFileContent = async (file, arrayBuffer) => {
    const extension = file.name.split('.').pop().toLowerCase();

    try {
      if (extension === 'pdf') {
        const texto = await extrairPDF(arrayBuffer)
        return `[ARQUIVO PDF: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]\nIMPORTANTE: Este é um arquivo PDF que contém informações relevantes para a análise da rotina.\nO usuário anexou este documento para fornecer contexto adicional.`;
      } else if (extension === 'docx') {
        const resultado = await mammoth.convertToHtml({arrayBuffer: arrayBuffer})
        return `[DOCUMENTO WORD: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]\n${resultado.value}💡 SOLUÇÃO MANUAL: Abra o documento e cole o conteúdo no contexto.`;
      } else if (['xls', 'xlsx'].includes(extension)) {
        const workbook = XLSX.read(arrayBuffer, {type: 'array'})

        const conteudoDeTodasAsabas = workbook.SheetNames.map(aba => {
        const planilha = workbook.Sheets[aba]
        const csvCompleto = XLSX.utils.sheet_to_csv(planilha)
        console.log(csvCompleto)
        const linhas = csvCompleto.split('\n')
        const limiteDelinhas = 100
        const csvLimitado = linhas.slice(0, limiteDelinhas).join('\n')
        const avisoCorte = linhas.length > limiteDelinhas
        ? `\n\n⚠️ NOTA: Planilha muito longa. Exibindo apenas as primeiras ${limiteDelinhas} de ${linhas.length} linhas para preservar o limite de tokens.`
    : '';
         return ` --- ABA:${aba} --- \n${csvLimitado}${avisoCorte}`}).join('\n\n')

        return `[PLANILHA EXCEL: ${file.name} - ${(file.size / 1024).toFixed(1)}KB]\n\nCONTÉUDO DA PLANILHA:\N${conteudoDeTodasAsabas}SOLUÇÃO MANUAL: Identifique dados relevantes e descreva no contexto.`;
        }
    } catch (error) {
      console.error('Erro no processamento:', error);
      return `[ARQUIVO: ${file.name}]\nErro geral no processamento: ${error.message}`;
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    
    for (const file of files) {
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/bmp', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain', 'text/csv', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
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
            name: file.name, type: file.type, size: file.size,
            url: e.target.result, file: file, isImage: true,
            processedContent: `[IMAGEM: ${file.name}]\nEsta é uma imagem anexada.`
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
            name: file.name, type: file.type, size: file.size,
            content: e.target.result, processedContent: processedContent,
            file: file, isImage: false
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
      return
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
      



      let changesContext = systemChanges.trim() ? `\nMUDANCAS NO SISTEMA: ${systemChanges.trim()}` : '';
      let environmentContext = datasulVersion.trim() ? `\nAMBIENTE: Versao Datasul: ${datasulVersion}` : '';
      let questionContext = specificQuestion.trim() ? `\nPERGUNTA ESPECIFICA DO USUARIO: "${specificQuestion.trim()}"\nIMPORTANTE: Alem da analise geral da rotina, de atencao especial para responder esta pergunta especifica do usuario.` : '';
      
      const prompt = `Analise a rotina Datasul: ${routineCode}\n\nCONTEXTO: ${context || 'Nenhum'}${attachmentContext}${changesContext}${environmentContext}${questionContext}\n\nResponda apenas com JSON (sem backticks):
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

 const imagens = uploadedFiles.filter(file => file.isImage)

 const imagensFormatadas = imagens.map(file => ({type: "image_url", image_url: { url: file.url }}))



      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          content: [
            ...imagensFormatadas,
            {type: "text", text: prompt}
          ]
         })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha na requisição da API');
      }

      const data = await response.json();
      let cleanResponse = data.response.trim();
      if (cleanResponse.startsWith('```json')) cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      else if (cleanResponse.startsWith('```')) cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      
      const result = JSON.parse(cleanResponse);
      setAnalysis(result);
      
      const newEntry = {
        id: Date.now(),
        routineCode,
        context: context || 'Sem contexto',
        systemChanges: systemChanges || 'Nenhuma mudanca informada',
        datasulVersion: datasulVersion || 'Nao informada',
        specificQuestion: specificQuestion || 'Nenhuma pergunta especifica',
        attachments: uploadedFiles.map(file => ({ 
          name: file.name, type: getFileTypeLabel(file.name), size: file.size,
          url: file.url || null, isImage: file.isImage || false, wasProcessed: !!file.processedContent
        })),
        analysis: result,
        timestamp: new Date().toLocaleString('pt-BR')
      };
      
      setHistory(prev => [newEntry, ...prev.slice(0, 9)]);
      
    } catch (error) {
      console.error('Erro completo ao analisar rotina:', error);
      alert(`Erro ao analisar a rotina: ${error.message}`);
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
    setUploadedFiles([]); // Simplificado para evitar recarregar anexos complexos
    setAnalysis(entry.analysis);
  };

  return {
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
  };
};