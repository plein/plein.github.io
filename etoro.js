const exampleJson = {
    "AggregatedResult": {
        "ResponseSummary": {
            "StatusCode": 200,
            "IsSuccess": true,
            "ErrorMessage": null,
            "ErrorInCall": null,
            "ApplicationName": "ReToro",
            "ApplicationVersion": "v651.784.1",
            "Cid": 1,
            "AccountType": "Real",
            "IsInMaintenance": false,
            "MaintenanceRedirectUrl": null,
            "ClientRatesRefreshIntervalInSeconds": 900
        },
        "ApiResponses": {
            "PrivatePortfolio": {
                "Content": {
                    "ClientPortfolio": {
                        "Positions": [
                            {
                                "PositionID": 111111,
                                "CID": 222222,
                                "OpenDateTime": "2025-06-26T16:01:13.8Z",
                                "OpenRate": 173.57,
                                "InstrumentID": 1002,
                                "IsBuy": true,
                                "TakeProfitRate": 1908.94,
                                "StopLossRate": 0.0001,
                                "MirrorID": 0,
                                "ParentPositionID": 0,
                                "Amount": 1000.0,
                                "Leverage": 1,
                                "OrderID": 1,
                                "OrderType": 17,
                                "Units": 1,
                                "TotalFees": 0.0,
                                "InitialAmountInDollars": 1000.0,
                                "IsTslEnabled": false,
                                "StopLossVersion": 1,
                                "IsSettled": true,
                                "RedeemStatusID": 0,
                                "InitialUnits": 1,
                                "IsPartiallyAltered": false,
                                "UnitsBaseValueDollars": 2000.0,
                                "IsDiscounted": true,
                                "OpenPositionActionType": 0,
                                "SettlementTypeID": 1,
                                "IsDetached": false,
                                "OpenConversionRate": 1.0,
                                "PnlVersion": 1,
                                "TotalExternalFees": 0.0,
                                "TotalExternalTaxes": 0.0,
                                "IsNoTakeProfit": false,
                                "IsNoStopLoss": true,
                                "LotCount": 11.522728
                            }
                        ],
                        "Mirrors": [],
                        "Credit": 0.0,
                        "Orders": [],
                        "StockOrders": [],
                        "EntryOrders": [],
                        "ExitOrders": [],
                        "OrdersForOpen": [],
                        "OrdersForClose": [],
                        "OrdersForCloseMultiple": [],
                        "BonusCredit": 0.0
                    }
                },
                "StatusCode": 200,
                "ErrorMessage": null
            },
            "CurrentUserData": {},
            "CustomerRestrictions": {},
            "MirrorsUserData": {}
        }
    },
    "Configuration": {
        "Push": {
            "RealUrl": "https://push-lightstreamer.cloud.etoro.com/",
            "DemoUrl": "https://push-demo-lightstreamer.cloud.etoro.com/"
        }
    }
};

document.getElementById('json-input').value =
    JSON.stringify(exampleJson, null, 2);

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
        var warnings = '';
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
    const includeCols = [0,1,2,3]; 

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