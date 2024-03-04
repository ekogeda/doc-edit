export const useDownloadPDFFromServer = (pdfUrl, filename) => {
  fetch(pdfUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(blob => {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename + '.pdf' || 'document.pdf';
      a.click();
      URL.revokeObjectURL(a.href);
    })
    .catch(error => {
      console.error('Error fetching or downloading the PDF:', error);
    });
}