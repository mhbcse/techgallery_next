interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const getPages = () => {
    const pages: (number | '...')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('...')
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i)
      }
      if (currentPage < totalPages - 2) pages.push('...')
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="mt-12 flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-icons-outlined text-sm">chevron_left</span>
      </button>
      {getPages().map((page, i) =>
        page === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-slate-400">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-medium transition-colors ${
              page === currentPage
                ? 'bg-primary text-white font-bold shadow-lg shadow-primary/20'
                : 'border border-pink-100 hover:bg-pink-50'
            }`}
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-10 h-10 flex items-center justify-center rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-icons-outlined text-sm">chevron_right</span>
      </button>
    </div>
  )
}
