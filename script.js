function generatePDF() {
    const userCode = document.getElementById('userCode').value;
    if (!userCode) {
        alert('Please enter a code.');
        return;
    }

    fetch(`http://localhost:3000/generate-pdf?code=${encodeURIComponent(userCode)}`)
        .then(response => response.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'Amizade25 Ticket.pdf';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        })
        .catch(error => console.error('Error:', error));
}
