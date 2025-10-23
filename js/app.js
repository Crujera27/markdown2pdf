marked.setOptions({
    breaks: true,
    gfm: true,
    headerIds: true,
    mangle: false
});

// DOM Elements
const markdownInput = document.getElementById('markdown-input');
const markdownPreview = document.getElementById('markdown-preview');
const fileInput = document.getElementById('markdown-file');
const fileName = document.getElementById('file-name');
const clearBtn = document.getElementById('clear-btn');
const convertBtn = document.getElementById('convert-btn');
const customizeToggle = document.getElementById('customize-toggle');
const customizePanel = document.getElementById('customize-panel');
const resetBtn = document.getElementById('reset-btn');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Customization inputs
const fontSizeInput = document.getElementById('font-size');
const lineHeightInput = document.getElementById('line-height');
const fontFamilyInput = document.getElementById('font-family');
const pageSizeInput = document.getElementById('page-size');
const orientationInput = document.getElementById('orientation');
const headingColorInput = document.getElementById('heading-color');

// Margin inputs
const marginTopInput = document.getElementById('margin-top');
const marginBottomInput = document.getElementById('margin-bottom');
const marginLeftInput = document.getElementById('margin-left');
const marginRightInput = document.getElementById('margin-right');
const paragraphSpacingInput = document.getElementById('paragraph-spacing');
const headingSpacingInput = document.getElementById('heading-spacing');

// Value display elements
const fontSizeValue = document.getElementById('font-size-value');
const lineHeightValue = document.getElementById('line-height-value');
const marginTopValue = document.getElementById('margin-top-value');
const marginBottomValue = document.getElementById('margin-bottom-value');
const marginLeftValue = document.getElementById('margin-left-value');
const marginRightValue = document.getElementById('margin-right-value');
const paragraphSpacingValue = document.getElementById('paragraph-spacing-value');
const headingSpacingValue = document.getElementById('heading-spacing-value');

// Live Preview Update
markdownInput.addEventListener('input', () => {
    updatePreview();
});

function updatePreview() {
    const markdownText = markdownInput.value;
    const htmlContent = marked.parse(markdownText);
    markdownPreview.innerHTML = DOMPurify.sanitize(htmlContent);
}

// File Upload Handler
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = `${file.name}`;
        const reader = new FileReader();
        reader.onload = (event) => {
            markdownInput.value = event.target.result;
            updatePreview();
        };
        reader.readAsText(file);
    }
});

// Clear Button Handler
clearBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all content?')) {
        markdownInput.value = '';
        markdownPreview.innerHTML = '';
        fileName.textContent = '';
        fileInput.value = '';
    }
});

// Customize Toggle Handler
customizeToggle.addEventListener('click', () => {
    customizePanel.classList.toggle('active');
    const icon = customizeToggle.querySelector('i');
    if (customizePanel.classList.contains('active')) {
        icon.style.transform = 'rotate(180deg)';
    } else {
        icon.style.transform = 'rotate(0deg)';
    }
});

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        
        // Remove active class from all tabs and contents
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        // Add active class to clicked tab and corresponding content
        btn.classList.add('active');
        document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
});

// Update value displays for range inputs
fontSizeInput.addEventListener('input', (e) => {
    fontSizeValue.textContent = `${e.target.value}px`;
});

lineHeightInput.addEventListener('input', (e) => {
    lineHeightValue.textContent = e.target.value;
});

marginTopInput.addEventListener('input', (e) => {
    marginTopValue.textContent = `${e.target.value}mm`;
});

marginBottomInput.addEventListener('input', (e) => {
    marginBottomValue.textContent = `${e.target.value}mm`;
});

marginLeftInput.addEventListener('input', (e) => {
    marginLeftValue.textContent = `${e.target.value}mm`;
});

marginRightInput.addEventListener('input', (e) => {
    marginRightValue.textContent = `${e.target.value}mm`;
});

paragraphSpacingInput.addEventListener('input', (e) => {
    paragraphSpacingValue.textContent = `${e.target.value}px`;
});

headingSpacingInput.addEventListener('input', (e) => {
    headingSpacingValue.textContent = `${e.target.value}px`;
});

// Reset to defaults
resetBtn.addEventListener('click', () => {
    if (confirm('Reset all customization settings to default values?')) {
        fontSizeInput.value = 16;
        lineHeightInput.value = 1.6;
        fontFamilyInput.value = 'Roboto';
        pageSizeInput.value = 'a4';
        orientationInput.value = 'portrait';
        headingColorInput.value = '#6d5b97';
        marginTopInput.value = 20;
        marginBottomInput.value = 20;
        marginLeftInput.value = 20;
        marginRightInput.value = 20;
        paragraphSpacingInput.value = 15;
        headingSpacingInput.value = 20;
        
        fontSizeValue.textContent = '16px';
        lineHeightValue.textContent = '1.6';
        marginTopValue.textContent = '20mm';
        marginBottomValue.textContent = '20mm';
        marginLeftValue.textContent = '20mm';
        marginRightValue.textContent = '20mm';
        paragraphSpacingValue.textContent = '15px';
        headingSpacingValue.textContent = '20px';
        
        localStorage.removeItem('pdf-preferences');
        
        alert('✅ Settings reset to defaults!');
    }
});

// Convert to PDF Handler
convertBtn.addEventListener('click', async () => {
    const markdownText = markdownInput.value.trim();
    
    if (!markdownText) {
        alert('Please enter some Markdown content first!');
        return;
    }

    convertBtn.classList.add('loading');
    convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Converting...';

    try {
        await convertToPDF();
        
        // Success state
        convertBtn.innerHTML = '<i class="fas fa-check"></i> Success!';
        setTimeout(() => {
            convertBtn.classList.remove('loading');
            convertBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
        }, 2000);
    } catch (error) {
        console.error('Error converting to PDF:', error);
        alert('❌ Error converting to PDF. Please try again.');
        convertBtn.classList.remove('loading');
        convertBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
    }
});

async function convertToPDF() {
    const { jsPDF } = window.jspdf;
    
    // Get customization values
    const fontSize = parseInt(fontSizeInput.value) || 16;
    const lineHeight = parseFloat(lineHeightInput.value) || 1.6;
    const fontFamily = fontFamilyInput.value || 'Roboto';
    const pageSize = pageSizeInput.value || 'a4';
    const orientation = orientationInput.value || 'portrait';
    const headingColor = headingColorInput.value || '#6d5b97';
    
    // Get margin values (in mm)
    const marginTop = parseInt(marginTopInput.value) || 20;
    const marginBottom = parseInt(marginBottomInput.value) || 20;
    const marginLeft = parseInt(marginLeftInput.value) || 20;
    const marginRight = parseInt(marginRightInput.value) || 20;
    
    // Get spacing values
    const paragraphSpacing = parseInt(paragraphSpacingInput.value) || 15;
    const headingSpacing = parseInt(headingSpacingInput.value) || 20;

    // Page format mapping
    const pageFormats = {
        'a4': { width: 210, height: 297 },
        'letter': { width: 215.9, height: 279.4 },
        'legal': { width: 215.9, height: 355.6 }
    };

    const format = pageFormats[pageSize] || pageFormats['a4'];
    const pageWidth = orientation === 'portrait' ? format.width : format.height;
    const pageHeight = orientation === 'portrait' ? format.height : format.width;

    // Create temporary container for rendering
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '794px'; // A4 width at 96 DPI
    tempContainer.style.fontSize = `${fontSize}px`;
    tempContainer.style.lineHeight = lineHeight;
    tempContainer.style.fontFamily = fontFamily;
    tempContainer.style.background = '#ffffff';
    tempContainer.style.color = '#333';
    tempContainer.style.padding = '40px';
    tempContainer.style.boxSizing = 'border-box';
    tempContainer.style.overflow = 'visible';
    tempContainer.style.border = 'none';
    tempContainer.style.outline = 'none';
    tempContainer.style.boxShadow = 'none';
    
    tempContainer.innerHTML = markdownPreview.innerHTML;
    document.body.appendChild(tempContainer);

    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        #temp-pdf-container * {
            font-family: ${fontFamily}, sans-serif;
            border: none !important;
            outline: none !important;
        }
        #temp-pdf-container {
            font-size: ${fontSize}px;
            line-height: ${lineHeight};
            color: #333;
            background: #ffffff !important;
        }
        #temp-pdf-container h1 { 
            font-size: 2em; 
            margin-top: ${headingSpacing}px; 
            margin-bottom: ${headingSpacing / 2}px; 
            color: ${headingColor};
            font-weight: bold;
            page-break-after: avoid;
            page-break-inside: avoid;
            border: none !important;
            background: transparent !important;
        }
        #temp-pdf-container h2 { 
            font-size: 1.5em; 
            margin-top: ${headingSpacing * 0.9}px; 
            margin-bottom: ${headingSpacing / 2.5}px; 
            color: ${headingColor};
            font-weight: bold;
            page-break-after: avoid;
            page-break-inside: avoid;
            border: none !important;
            background: transparent !important;
        }
        #temp-pdf-container h3 { 
            font-size: 1.3em; 
            margin-top: ${headingSpacing * 0.8}px; 
            margin-bottom: ${headingSpacing / 2.5}px; 
            color: ${headingColor};
            font-weight: bold;
            page-break-after: avoid;
            page-break-inside: avoid;
            border: none !important;
            background: transparent !important;
        }
        #temp-pdf-container h4,
        #temp-pdf-container h5,
        #temp-pdf-container h6 { 
            margin-top: ${headingSpacing * 0.7}px; 
            margin-bottom: ${headingSpacing / 3}px; 
            color: ${headingColor};
            font-weight: bold;
            page-break-after: avoid;
            page-break-inside: avoid;
            border: none !important;
            background: transparent !important;
        }
        #temp-pdf-container p { 
            margin-bottom: ${paragraphSpacing}px;
            margin-top: 0;
            page-break-inside: avoid;
            border: none !important;
        }
        #temp-pdf-container ul, #temp-pdf-container ol { 
            margin-left: 30px; 
            margin-bottom: ${paragraphSpacing}px; 
            page-break-inside: avoid;
        }
        #temp-pdf-container li { 
            margin-bottom: ${paragraphSpacing / 3}px; 
        }
        #temp-pdf-container a {
            color: #8d58bf;
            text-decoration: underline;
            border: none !important;
        }
        #temp-pdf-container code { 
            background: #f0e6f6; 
            padding: 3px 6px; 
            border-radius: 3px; 
            font-family: 'Courier New', monospace;
            color: #8d58bf;
            font-size: 0.9em;
            border: none !important;
        }
        #temp-pdf-container pre { 
            background: #2d2d2d; 
            color: #f8f8f2; 
            padding: 15px; 
            border-radius: 5px;
            overflow-x: auto; 
            margin-bottom: ${paragraphSpacing}px;
            white-space: pre-wrap;
            word-wrap: break-word;
            page-break-inside: avoid;
            border: none !important;
        }
        #temp-pdf-container pre code { 
            background: transparent; 
            color: inherit; 
            padding: 0; 
        }
        #temp-pdf-container blockquote { 
            border-left: 4px solid ${headingColor}; 
            padding-left: 15px; 
            margin: ${paragraphSpacing}px 0; 
            color: #666; 
            font-style: italic;
            page-break-inside: avoid;
            border-right: none !important;
            border-top: none !important;
            border-bottom: none !important;
        }
        #temp-pdf-container table { 
            border-collapse: collapse; 
            width: 100%; 
            margin: ${paragraphSpacing}px 0;
            page-break-inside: avoid;
        }
        #temp-pdf-container table th, 
        #temp-pdf-container table td { 
            border: 1px solid #ddd; 
            padding: 8px; 
            text-align: left; 
        }
        #temp-pdf-container table th { 
            background: ${headingColor}; 
            color: white;
            font-weight: bold;
        }
        #temp-pdf-container table tr:nth-child(even) {
            background: #f9f9f9;
        }
        #temp-pdf-container img { 
            max-width: 100%; 
            height: auto; 
        }
        #temp-pdf-container strong {
            font-weight: bold;
        }
        #temp-pdf-container em {
            font-style: italic;
        }
    `;
    tempContainer.id = 'temp-pdf-container';
    document.head.appendChild(styleSheet);

    try {
        let filename = 'document.pdf';
        const firstHeading = tempContainer.querySelector('h1, h2, h3');
        if (firstHeading) {
            filename = firstHeading.textContent.trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '') + '.pdf';
        }

        const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false,
            windowWidth: tempContainer.scrollWidth,
            windowHeight: tempContainer.scrollHeight,
            removeContainer: false,
            imageTimeout: 0,
            foreignObjectRendering: false,
            onclone: (clonedDoc) => {
                const clonedContainer = clonedDoc.getElementById('temp-pdf-container');
                if (clonedContainer) {
                    clonedContainer.style.visibility = 'visible';
                    clonedContainer.style.background = '#ffffff';
                    const allElements = clonedContainer.querySelectorAll('*');
                    allElements.forEach(el => {
                        const computed = window.getComputedStyle(el);
                        if (computed.borderColor === 'rgb(0, 0, 0)' && 
                            computed.borderWidth !== '0px' && 
                            !el.matches('table, table *, blockquote')) {
                            el.style.border = 'none';
                        }
                        if (!el.matches('pre, pre *') && 
                            (computed.backgroundColor === 'rgb(0, 0, 0)' || 
                             computed.backgroundColor === 'rgba(0, 0, 0, 1)')) {
                            el.style.backgroundColor = 'transparent';
                        }
                    });
                }
            }
        });

        const pdf = new jsPDF({
            orientation: orientation,
            unit: 'mm',
            format: [pageWidth, pageHeight],
            compress: true
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = pageWidth - marginLeft - marginRight;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageContentHeight = pageHeight - marginTop - marginBottom;

        const scaleX = imgWidth / tempContainer.offsetWidth;
        const scaleY = imgHeight / tempContainer.offsetHeight;
        const pxToMm = imgWidth / tempContainer.offsetWidth;

        const textElements = extractTextElements(tempContainer);
        
        const blockElements = getBlockElements(tempContainer);

        const pageBreaks = calculateSmartPageBreaks(blockElements, pageContentHeight, pxToMm, imgHeight);
        
        for (let page = 0; page < pageBreaks.length; page++) {
            if (page > 0) {
                pdf.addPage([pageWidth, pageHeight], orientation);
            }
            
            const breakInfo = pageBreaks[page];
            
            const sourceY = breakInfo.startY * (canvas.height / imgHeight);
            const contentHeight = breakInfo.endY - breakInfo.startY;
            const sourceHeight = contentHeight * (canvas.height / imgHeight);
            
            const pageCanvas = document.createElement('canvas');
            pageCanvas.width = canvas.width;
            pageCanvas.height = Math.min(sourceHeight, canvas.height - sourceY);
            const pageCtx = pageCanvas.getContext('2d');
            
            pageCtx.fillStyle = '#ffffff';
            pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            
            pageCtx.drawImage(
                canvas,
                0, sourceY,
                canvas.width, pageCanvas.height,
                0, 0,
                canvas.width, pageCanvas.height
            );
            
            const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
            const sliceHeight = (pageCanvas.height * imgWidth) / canvas.width;
            
            pdf.addImage(
                pageImgData,
                'PNG',
                marginLeft,
                marginTop,
                imgWidth,
                sliceHeight,
                undefined,
                'FAST'
            );
            
            addTextLayerSmart(pdf, textElements, breakInfo, marginLeft, marginTop, pxToMm);
        }

        pdf.save(filename);

    } catch (error) {
        console.error('PDF Generation Error:', error);
        throw error;
    } finally {
        document.body.removeChild(tempContainer);
        document.head.removeChild(styleSheet);
    }
}

// Extract text elements with their positions and styles
function extractTextElements(container) {
    const elements = [];
    const containerRect = container.getBoundingClientRect();
    
    function processNode(node, inherited = {}) {
        if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent.trim();
            if (text) {
                const range = document.createRange();
                range.selectNodeContents(node);
                const rect = range.getBoundingClientRect();
                
                const parent = node.parentElement;
                const style = window.getComputedStyle(parent);
                
                elements.push({
                    text: text,
                    x: rect.left - containerRect.left,
                    y: rect.top - containerRect.top,
                    width: rect.width,
                    height: rect.height,
                    fontSize: parseFloat(style.fontSize),
                    fontWeight: style.fontWeight === 'bold' || parseInt(style.fontWeight) >= 600 ? 'bold' : 'normal',
                    fontStyle: style.fontStyle,
                    color: style.color,
                    tagName: parent.tagName.toLowerCase(),
                    isLink: parent.tagName === 'A',
                    href: parent.tagName === 'A' ? parent.href : null
                });
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            for (let child of node.childNodes) {
                processNode(child, inherited);
            }
        }
    }
    
    processNode(container);
    return elements;
}

// Get block-level elements that shouldn't be split across pages
function getBlockElements(container) {
    const blockElements = [];
    const containerRect = container.getBoundingClientRect();
    
    const selectors = 'p, h1, h2, h3, h4, h5, h6, li, pre, blockquote, table, tr, div > *';
    
    container.querySelectorAll(selectors).forEach(element => {
        const rect = element.getBoundingClientRect();
        if (rect.height > 0 && rect.width > 0) {
            // Skip if this element is inside another block element we're already tracking
            // (except for table rows which we want to track separately)
            const isTableRow = element.tagName.toLowerCase() === 'tr';
            const parentBlock = element.parentElement?.closest(selectors);
            
            if (!parentBlock || isTableRow || parentBlock === container) {
                blockElements.push({
                    element: element,
                    top: rect.top - containerRect.top,
                    bottom: rect.bottom - containerRect.top,
                    height: rect.height,
                    tagName: element.tagName.toLowerCase(),
                    priority: isTableRow ? 10 : (element.tagName.match(/^H[1-6]$/) ? 5 : 1)
                });
            }
        }
    });
    
    blockElements.sort((a, b) => a.top - b.top);
    return blockElements;
}

// Calculate smart page breaks that avoid cutting through elements
function calculateSmartPageBreaks(blockElements, pageContentHeight, pxToMm, totalHeight) {
    const pageBreaks = [];
    let currentPageStart = 0;
    
    while (currentPageStart < totalHeight) {
        let proposedBreak = Math.min(currentPageStart + pageContentHeight, totalHeight);
        let adjustedBreak = proposedBreak;
        
        let elementThatWouldBeCut = null;
        let smallestAdjustment = pageContentHeight;
        
        for (const block of blockElements) {
            const blockTopMm = block.top * pxToMm;
            const blockBottomMm = block.bottom * pxToMm;
            const blockHeight = blockBottomMm - blockTopMm;
            
            // Skips blocks that are completely before or after this page
            if (blockBottomMm <= currentPageStart || blockTopMm >= proposedBreak) continue;
            
            // Check if this block would be cut by the break point
            if (blockTopMm < proposedBreak && blockBottomMm > proposedBreak) {
                // This block would be cut
                
                // Calculate distance to move break point up or down
                const moveUpDistance = proposedBreak - blockTopMm; // Break before element
                const moveDownDistance = blockBottomMm - proposedBreak; // Break after element
                
                // Prefer smaller adjustment
                if (moveUpDistance < moveDownDistance && moveUpDistance < smallestAdjustment) {
                    // Break before this element (if it doesn't make the page too small)
                    if (blockTopMm - currentPageStart > pageContentHeight * 0.5) {
                        adjustedBreak = blockTopMm;
                        smallestAdjustment = moveUpDistance;
                    }
                } else if (moveDownDistance < smallestAdjustment) {
                    // Break after this element (if it fits on the page)
                    if (blockBottomMm - currentPageStart <= pageContentHeight * 1.2) {
                        adjustedBreak = blockBottomMm;
                        smallestAdjustment = moveDownDistance;
                    }
                }
            }
        }
        
        if (Math.abs(adjustedBreak - proposedBreak) > pageContentHeight * 0.3) {
            adjustedBreak = proposedBreak;
        }
        
        if (adjustedBreak <= currentPageStart) {
            adjustedBreak = Math.min(currentPageStart + pageContentHeight, totalHeight);
        }
        
        pageBreaks.push({
            startY: currentPageStart,
            endY: Math.min(adjustedBreak, totalHeight)
        });
        
        currentPageStart = adjustedBreak;
        
        if (currentPageStart >= totalHeight || pageBreaks.length > 100) {
            break;
        }
    }
    
    return pageBreaks;
}

// Add transparent text layer over the image with smart page breaks
function addTextLayerSmart(pdf, textElements, breakInfo, marginLeft, marginTop, pxToMm) {
    const pageStartY = breakInfo.startY;
    const pageEndY = breakInfo.endY;
    
    textElements.forEach(element => {
        const elementY = element.y * pxToMm;
        
        if (elementY >= pageStartY && elementY < pageEndY) {
            const xPos = marginLeft + (element.x * pxToMm);
            const yPos = marginTop + (elementY - pageStartY) + (element.fontSize * pxToMm * 0.75);
            
            const fontStyle = element.fontWeight === 'bold' ? 'bold' : 'normal';
            pdf.setFont('helvetica', fontStyle);
            
            const fontSizePt = element.fontSize * 0.75;
            pdf.setFontSize(fontSizePt);
            
            // Set text to be invisible but selectable (text rendering mode 3)
            // This makes the text transparent but still copyable
            pdf.setTextColor(0, 0, 0);
            
            pdf.internal.write('3 Tr');
            
            try {
                pdf.text(element.text, xPos, yPos, {
                    maxWidth: element.width * pxToMm || undefined
                });
            } catch (e) {
                // Fallback if text is too complex to process
                pdf.text(element.text, xPos, yPos);
            }
            
            pdf.internal.write('0 Tr');
            
            if (element.isLink && element.href) {
                const linkWidth = element.width * pxToMm;
                const linkHeight = element.height * pxToMm;
                const linkY = marginTop + (elementY - pageStartY);
                pdf.link(xPos, linkY, linkWidth, linkHeight, { url: element.href });
            }
        }
    });
}

updatePreview();

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to convert
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        convertBtn.click();
    }
    
    // Ctrl/Cmd + K to clear
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        clearBtn.click();
    }
});

let autoSaveTimeout;
markdownInput.addEventListener('input', () => {
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        localStorage.setItem('markdown-content', markdownInput.value);
    }, 1000);
});

window.addEventListener('load', () => {
    const savedContent = localStorage.getItem('markdown-content');
    if (savedContent && !markdownInput.value) {
        if (confirm('📝 Found saved content. Would you like to restore it?')) {
            markdownInput.value = savedContent;
            updatePreview();
        }
    }
});

[fontSizeInput, lineHeightInput, fontFamilyInput, pageSizeInput, orientationInput, 
 headingColorInput, marginTopInput, marginBottomInput, marginLeftInput, marginRightInput,
 paragraphSpacingInput, headingSpacingInput].forEach(input => {
    input.addEventListener('change', () => {
        const preferences = {
            fontSize: fontSizeInput.value,
            lineHeight: lineHeightInput.value,
            fontFamily: fontFamilyInput.value,
            pageSize: pageSizeInput.value,
            orientation: orientationInput.value,
            headingColor: headingColorInput.value,
            marginTop: marginTopInput.value,
            marginBottom: marginBottomInput.value,
            marginLeft: marginLeftInput.value,
            marginRight: marginRightInput.value,
            paragraphSpacing: paragraphSpacingInput.value,
            headingSpacing: headingSpacingInput.value
        };
        localStorage.setItem('pdf-preferences', JSON.stringify(preferences));
    });
});

window.addEventListener('load', () => {
    const savedPreferences = localStorage.getItem('pdf-preferences');
    if (savedPreferences) {
        try {
            const preferences = JSON.parse(savedPreferences);
            if (preferences.fontSize) {
                fontSizeInput.value = preferences.fontSize;
                fontSizeValue.textContent = `${preferences.fontSize}px`;
            }
            if (preferences.lineHeight) {
                lineHeightInput.value = preferences.lineHeight;
                lineHeightValue.textContent = preferences.lineHeight;
            }
            if (preferences.fontFamily) fontFamilyInput.value = preferences.fontFamily;
            if (preferences.pageSize) pageSizeInput.value = preferences.pageSize;
            if (preferences.orientation) orientationInput.value = preferences.orientation;
            if (preferences.headingColor) headingColorInput.value = preferences.headingColor;
            if (preferences.marginTop) {
                marginTopInput.value = preferences.marginTop;
                marginTopValue.textContent = `${preferences.marginTop}mm`;
            }
            if (preferences.marginBottom) {
                marginBottomInput.value = preferences.marginBottom;
                marginBottomValue.textContent = `${preferences.marginBottom}mm`;
            }
            if (preferences.marginLeft) {
                marginLeftInput.value = preferences.marginLeft;
                marginLeftValue.textContent = `${preferences.marginLeft}mm`;
            }
            if (preferences.marginRight) {
                marginRightInput.value = preferences.marginRight;
                marginRightValue.textContent = `${preferences.marginRight}mm`;
            }
            if (preferences.paragraphSpacing) {
                paragraphSpacingInput.value = preferences.paragraphSpacing;
                paragraphSpacingValue.textContent = `${preferences.paragraphSpacing}px`;
            }
            if (preferences.headingSpacing) {
                headingSpacingInput.value = preferences.headingSpacing;
                headingSpacingValue.textContent = `${preferences.headingSpacing}px`;
            }
        } catch (e) {
            console.error('Error loading preferences:', e);
        }
    }
});