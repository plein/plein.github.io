// JavaScript for etoro.html

// Load instrument mapping and wire up JSON processing functionality
const instrumentMapPromise = fetch('etoro/instruments.json')
    .then(resp => resp.json())
    .then(data => {
        const map = {};
        if (data && Array.isArray(data.InstrumentDisplayDatas)) {
            data.InstrumentDisplayDatas.forEach(item => {
                if (item.InstrumentID != null) {
                    const symbol = (item.InstrumentTypeID == 10)
                        ? `${item.SymbolFull}-USD`
                        : item.SymbolFull;
                    map[item.InstrumentID] = symbol;
                }
            });
        }
        return map;
    })
    .catch(err => {
        console.error('Failed to load instruments:', err);
        return {};
    });

// Handle Process JSON button
window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('process-btn').addEventListener('click', async function () {
        const instrumentMap = await instrumentMapPromise;
        const input = document.getElementById('json-input').value;
        let data;
        try {
            data = JSON.parse(input);
        } catch (e) {
            alert('Invalid JSON: ' + e.message);
            return;
        }

        let positions;
        try {
            positions = data.AggregatedResult.ApiResponses.PrivatePortfolio.Content.ClientPortfolio.Positions;
            if (!Array.isArray(positions)) throw new Error('Positions not found');
        } catch (e) {
            alert('Could not locate positions in JSON');
            return;
        }

        const resultDiv = document.getElementById('result');
        resultDiv.innerHTML = '';

        const table = document.createElement('table');
        table.className = 'table table-striped';
        const header = document.createElement('tr');
        ['Symbol', 'Quantity', 'Cost', 'Date', 'Warnings'].forEach(col => {
            const th = document.createElement('th');
            th.textContent = col;
            header.appendChild(th);
        });
        table.appendChild(header);

        // Sort positions by total cost (OpenRate * Units) descending
        positions.sort((a, b) => (b.OpenRate * b.Units) - (a.OpenRate * a.Units));

        positions.forEach(pos => {
            const tr = document.createElement('tr');
            const d = new Date(pos.OpenDateTime);
            const month = ('0' + (d.getMonth() + 1)).slice(-2);
            const day = ('0' + d.getDate()).slice(-2);
            const year = d.getFullYear();
            const iso = `${year}-${month}-${day}`;
            let warnings = '';
            if (!pos.IsBuy) {
                warnings += 'SHORT Position\n';
            }
            if (pos.OpenConversionRate != 1) {
                warnings += 'Non US stock position. Might fail to import into some systems';
            }

            const symbol = instrumentMap[pos.InstrumentID] || '';
            const values = [
                symbol,
                pos.Units,
                pos.OpenRate,
                iso,
                warnings
            ];

            values.forEach(v => {
                const td = document.createElement('td');
                td.textContent = v;
                tr.appendChild(td);
            });
            table.appendChild(tr);
        });

        resultDiv.appendChild(table);

        const exportBtn = document.getElementById('export-btn');
        exportBtn.disabled = false;
        exportBtn.onclick = function () {
            // only these column-indices will be exported:
            const includeCols = [0, 1, 2, 3];

            const rows = table.querySelectorAll('tr');
            const lines = [];
            rows.forEach(row => {
                const cells = Array.from(row.querySelectorAll('th, td'));
                // keep only the ones in includeCols:
                const filtered = cells
                    .filter((_, idx) => includeCols.includes(idx))
                    .map(cell => {
                        let text = cell.textContent.trim();
                        if (/["]|,|\n/.test(text)) {
                            text = '"' + text.replace(/"/g, '""') + '"';
                        }
                        return text;
                    });
                lines.push(filtered.join(','));
            });

            const csv = lines.join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'positions.csv';
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        };
    });
});
