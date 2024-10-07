
function extractFilterKey(scanFolderName) {
    const parts = scanFolderName.split('-');
    return parts.length >= 3 ? parts[2] : 'Not Found Project Name';
}
// Helper function to convert file names
function getPreviewFileName(scanFileName) {
    // Return the original file name
    return scanFileName;
}
function getPreviewFilerename(basePath, scanFileName) {
    // Return the original file name
    const previevn = "Preview";
    const andek = ".grey";
    const ek = '/'
    return basePath + ek + previevn + ek + scanFileName + andek;
}
let filterMap = {};
let folderMap = {};
// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function () {
    // Tüm nav-link'leri seç
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    // Her bir nav-link için tıklama olayını dinle
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            // Aktif sınıfını kaldır
            navLinks.forEach(link => link.classList.remove('active'));
            // Aktif sınıfını ekle
            this.classList.add('active');
        });
    });
});

document.getElementById('uploadButton').addEventListener('click', function () {
    document.getElementById('folderInput').click();
});

document.getElementById('folderInput').addEventListener('change', async function (event) {
    const files = event.target.files;
    const loading = document.getElementById('loading');
    const filterList = document.getElementById('filterList');

    filterList.innerHTML = '';
    loading.style.display = 'flex';



    let basePath = '';

    let totalScannedFiles = 0;
    let faultyFilesCount = 0;

    try {
        for (let file of files) {
            const pathParts = file.webkitRelativePath.split('/');

            if (!basePath) basePath = pathParts[0];

            if (pathParts[1] === 'Scans' && file.name.endsWith('.fls')) {
                const scanFolderName = pathParts[2];
                const filterKey = extractFilterKey(scanFolderName);

                if (!folderMap[scanFolderName]) {
                    folderMap[scanFolderName] = { scanFiles: [], previewFile: null, totalSize: 0 };
                }

                if (!filterMap[filterKey]) {
                    filterMap[filterKey] = [];
                }

                filterMap[filterKey].push(scanFolderName);
            }

            if (pathParts[1] === 'Scans' && pathParts[3] === 'Scans' && pathParts[4] === '1') {
                const scanFolderName = pathParts[2];

                if (!folderMap[scanFolderName]) {
                    folderMap[scanFolderName] = { scanFiles: [], previewFile: null, totalSize: 0 };
                }
                folderMap[scanFolderName].scanFiles.push(file);
                folderMap[scanFolderName].totalSize += file.size;
            } else if (pathParts[1] === 'Preview') {
                const previewName = getPreviewFileName(pathParts[2]);


                // console.log('file.name', file.name)
                if (file.name === previewName) {

                    if (folderMap[pathParts[2]]) {
                        folderMap[scanFolderName] = { scanFiles: [], previewFile: [], totalSize: 0 };
                    } else if (folderMap[file.name.replace('.grey', '').replace('.jpg', '')]) { folderMap[file.name.replace('.grey', '').replace('.jpg', '')].previewFile = file; }
                    // folderMap[file.name.replace('.grey', '').replace('.jpg', '')].previewFile = file;
                }
            }
        }

        for (let filterKey in filterMap) {
            const groupHeader = document.createElement('div');
            // groupHeader.className = 'filter-header';
            groupHeader.className = 'list-group-item';
            groupHeader.setAttribute('aria-expanded', 'false');
            groupHeader.setAttribute('data-toggle', 'collapse');

            groupHeader.setAttribute('data-target', `#collapse-${filterKey}`);
            groupHeader.textContent = filterKey;

            const collapseDiv = document.createElement('div');
            collapseDiv.className = 'collapse';
            collapseDiv.id = `collapse-${filterKey}`;

            const groupList = document.createElement('ul');
            groupList.className = 'list-group';

            collapseDiv.appendChild(groupList);

            filterList.appendChild(groupHeader);
            filterList.appendChild(collapseDiv);

            filterMap[filterKey].forEach(scanFolderName => {
                const { scanFiles, previewFile, totalSize } = folderMap[scanFolderName];
                totalScannedFiles++;

                let status = 'Level 5';
                let seviye = 'Faulty';

                if (scanFiles.length >= 22 && scanFiles.length <= 24) {
                    if (totalSize >= 110000000 && totalSize <= 340000000) {
                        if (scanFiles.length === 23) {
                            status = 'Level 1';
                        } else if (scanFiles.length === 22) {
                            status = 'Level 2';
                        } else if (scanFiles.length === 24) {
                            status = 'Level 3';
                        }
                    } else if (totalSize >= 85000000 && totalSize < 110000000) {
                        status = 'Level 3';
                    }
                } else if (scanFiles.length < 22) {
                    status = 'Level 4';
                } else if (totalSize < 85000000) {
                    status = 'Level 5';

                }

                const listItem = document.createElement('li');
                listItem.className = `list-group-item status-${status[0]}`;

                if (!previewFile) {
                    status = 'Level 5';
                    seviye = 'Faulty';
                }

                // Add class according to status
                switch (status) {
                    case 'Level 1':
                        listItem.classList.add('status-1');
                        seviye = 'Normal';
                        break;
                    case 'Level 2':
                        listItem.classList.add('status-2');
                        seviye = 'Normal';
                        break;
                    case 'Level 3':
                        listItem.classList.add('status-3');
                        seviye = 'Check';
                        break;
                    case 'Level 4':
                        listItem.classList.add('status-4');
                        seviye = 'Risky';
                        break;
                    case 'Level 5':
                        listItem.classList.add('status-5');
                        seviye = 'Faulty';
                        faultyFilesCount++;
                        break;
                }

                if (!previewFile) {
                    status = 'Level 5';
                    seviye = 'Faulty';
                }

                const itemText = document.createElement('div');
                itemText.innerHTML = `
                    <strong>Scan Point :</strong> ${scanFolderName}<br>
                    <strong>Number of Files in Folder 1 :</strong> ${scanFiles.length}<br>
                    <strong>Total Size :</strong> ${(totalSize / (1024 * 1024)).toFixed(2)} MB<br>
                    <strong>Status :</strong> ${seviye}
                `;

                listItem.appendChild(itemText);

                if (previewFile) {
                    const img = document.createElement('img');
                    img.src = URL.createObjectURL(previewFile);
                    listItem.appendChild(img);
                } else {
                    const noImage = document.createElement('div');
                    noImage.textContent = "No Image Found";
                    listItem.appendChild(noImage);
                }

                groupList.appendChild(listItem);
            });
        }
        document.getElementById('totalScanned').textContent = totalScannedFiles;
        document.getElementById('faultyFiles').textContent = faultyFilesCount;

        // Initialize Bootstrap's collapse component
        $('.collapse').collapse();
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please check the console.');
    } finally {
        loading.style.display = 'none';
    }
});

document.getElementById('generatePDF').addEventListener('click', () => {
    const loading = document.getElementById('loading');
    loading.textContent = "Generating..."; // Change the text
    loading.style.display = 'flex'; // Show "Generating..." text

    html2canvas(document.getElementById('filterList')).then(canvas => {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190; // Page width
        const pageHeight = 295; // Page height
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        pdf.save('scan_files.pdf');
    }).catch(error => {
        console.error('Error creating PDF:', error);
        alert('An error occurred while creating the PDF.');
    }).finally(() => {
        loading.style.display = 'none'; // Hide the text when the process is complete
    });
});
document.getElementById('folderInput').addEventListener('change', async function (event) {
    const files = event.target.files;
    let totalScanned = 0;
    let faultyFiles = 0;

    // Your existing code...

    // Calculate the number of faulty files
    for (let filterKey in filterMap) {
        filterMap[filterKey].forEach(scanFolderName => {
            const { scanFiles, previewFile, totalSize } = folderMap[scanFolderName];
            totalScanned++;
            if (!previewFile || totalSize < 85000000) {
                faultyFiles++;
            }
        });
    }

    // Update the summary section
    document.getElementById('totalScanned').textContent = totalScanned;
    document.getElementById('faultyFiles').textContent = faultyFiles;

    // Your existing code...
});

