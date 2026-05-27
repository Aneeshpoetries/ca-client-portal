import { motion } from 'framer-motion';
import {
  RiFilePdfLine, RiFileExcelLine, RiFileImageLine, RiFileTextLine,
  RiDownloadLine, RiDeleteBinLine,
} from 'react-icons/ri';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  'application/pdf':                                                          { icon: RiFilePdfLine,   colorCls: 'text-red-600 dark:text-red-400',    bgCls: 'bg-red-50 dark:bg-[#2c1414]'    },
  'application/vnd.ms-excel':                                                 { icon: RiFileExcelLine, colorCls: 'text-green-600 dark:text-green-400', bgCls: 'bg-green-50 dark:bg-[#182820]'  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':       { icon: RiFileExcelLine, colorCls: 'text-green-600 dark:text-green-400', bgCls: 'bg-green-50 dark:bg-[#182820]'  },
  'image/jpeg':                                                               { icon: RiFileImageLine, colorCls: 'text-blue-600 dark:text-blue-400',   bgCls: 'bg-blue-50 dark:bg-[#1a2c40]'   },
  'image/png':                                                                { icon: RiFileImageLine, colorCls: 'text-blue-600 dark:text-blue-400',   bgCls: 'bg-blue-50 dark:bg-[#1a2c40]'   },
  default:                                                                    { icon: RiFileTextLine,  colorCls: 'text-purple-700 dark:text-purple-400', bgCls: 'bg-purple-50 dark:bg-[#241c38]' },
};

const catBadge = {
  client_document: { label: 'Client',  cls: 'badge-blue'   },
  gst_return:      { label: 'GST',     cls: 'badge-green'  },
  itr:             { label: 'ITR',     cls: 'badge-purple' },
  other_return:    { label: 'Return',  cls: 'badge-yellow' },
};

function fmt(bytes) {
  if (!bytes) return '';
  if (bytes < 1024)    return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export default function FileCard({ doc, onDelete, delay = 0 }) {
  const { user } = useAuth();
  const { icon: FileIcon, colorCls, bgCls } = iconMap[doc.mimeType] || iconMap.default;
  const badge    = catBadge[doc.category] || catBadge.other_return;
  const canDelete = user?.role === 'ca' || doc.uploadedBy?._id === user?._id;

  const handleDownload = async () => {
    try {
      const res = await api.get(`/documents/download/${doc._id}`);
      const { fileUrl, originalName } = res.data;
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = originalName;
      a.target = '_blank';
      document.body.appendChild(a); a.click(); a.remove();
    } catch { toast.error('Download failed'); }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this document?')) return;
    try {
      await api.delete(`/documents/${doc._id}`);
      toast.success('Deleted'); onDelete?.(doc._id);
    } catch { toast.error('Delete failed'); }
  };

  const uploaderBadge = (() => {
    const role = doc.uploadedBy?.role;
    const isMe = doc.uploadedBy?._id === user?._id;
    if (isMe)
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-600 dark:bg-[#1a2c40] dark:text-[#60a5fa]">
          ↑ You
        </span>
      );
    if (role === 'ca')
      return (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 dark:bg-[#182820] dark:text-[#34d399]">
          ↓ {doc.uploadedBy?.name} · CA
        </span>
      );
    return (
      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 dark:bg-[#1a2020] dark:text-[var(--c-text-2)]">
        ↓ {doc.uploadedBy?.name} · Staff
      </span>
    );
  })();

  const periodStr = doc.period?.year
    ? [doc.period.financialYear || doc.period.year, doc.period.quarter].filter(Boolean).join(' · ')
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="card card-hover flex items-center gap-4 px-4 py-3.5 group"
    >
      
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgCls}`}>
        <FileIcon className={`text-lg ${colorCls}`} />
      </div>

      
      <div className="flex-1 min-w-0">

        
        <div className="flex items-center gap-2">
          <p
            className="text-sm font-semibold text-[var(--c-text-1)] truncate flex-1"
            title={doc.originalName}
          >
            {doc.originalName}
          </p>
          <span className={`${badge.cls} flex-shrink-0`}>{badge.label}</span>
        </div>


        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {doc.documentType && doc.documentType !== 'other' && (
            <>
              <span className="text-xs text-indigo-500 font-medium">{doc.documentType}</span>
              {(periodStr || fmt(doc.fileSize)) && (
                <span className="text-xs text-[var(--c-text-3)]">·</span>
              )}
            </>
          )}
          {periodStr && (
            <>
              <span className="text-xs text-[var(--c-text-3)]">{periodStr}</span>
              {fmt(doc.fileSize) && <span className="text-xs text-[var(--c-text-3)]">·</span>}
            </>
          )}
          {fmt(doc.fileSize) && (
            <span className="text-xs text-[var(--c-text-3)]">{fmt(doc.fileSize)}</span>
          )}
        </div>


        {doc.description && (
          <p className="text-xs text-[var(--c-text-3)] mt-0.5 line-clamp-1">{doc.description}</p>
        )}

        
        <div className="mt-1.5">{uploaderBadge}</div>
      </div>

      
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={handleDownload}
          className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-[#1a2c40] text-[var(--c-text-3)] hover:text-indigo-600 dark:hover:text-[#60a5fa] transition-colors"
          title="Download"
        >
          <RiDownloadLine className="text-base" />
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-[#2c1414] text-[var(--c-text-3)] hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Delete"
          >
            <RiDeleteBinLine className="text-base" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
