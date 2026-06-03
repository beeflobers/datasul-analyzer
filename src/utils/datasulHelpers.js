// src/utils/datasulHelpers.js
import React from 'react';
import { Image, FileText, File } from 'lucide-react';

export const getFileIcon = (fileName) => {
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

export const getFileTypeLabel = (fileName) => {
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

export const getModuleColor = (module) => {
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