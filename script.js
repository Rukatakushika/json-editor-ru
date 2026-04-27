const startData = {
    "пример": {
        "текст": "Привет, мир!",
        "число": 42,
        "массив": [1, 2, 3],
        "объект": {
            "вложенное": "значение"
        }
    },
    "подсказка": "Нажмите ⋮ справа от поля → Duplicate"
};

const options = {
    mode: 'tree',
    modes: ['tree', 'code', 'text'],
    onChange: function() {
        updateStatus('✅ Изменения сохранены');
    },
    onError: function(err) {
        updateStatus('❌ Ошибка: ' + err.message, true);
    }
};

let editor;

function updateStatus(message, isError = false) {
    const statusDiv = document.getElementById('status');
    if (!statusDiv) return;
    
    statusDiv.textContent = message;
    statusDiv.style.color = isError ? '#e74c3c' : '#1abc9c';
    
    setTimeout(() => {
        if (document.getElementById('status') && 
            document.getElementById('status').textContent === message) {
            statusDiv.style.color = '#bdc3c7';
            statusDiv.textContent = 'Готов';
        }
    }, 2000);
}

document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('editor-container');
    if (!container) {
        console.error('Контейнер редактора не найден');
        return;
    }
    
    
    editor = new JSONEditor(container, options, startData);
    updateStatus('✅ Редактор готов');
    
        
    const newBtn = document.getElementById('btn-new');
    if (newBtn) {
        newBtn.onclick = () => {
            if (confirm('Создать новый JSON? Текущие данные будут потеряны.')) {
                editor.set({});
                updateStatus('✅ Создан новый JSON');
            }
        };
    }
    
    const saveBtn = document.getElementById('btn-save');
    if (saveBtn) {
        saveBtn.onclick = () => {
            try {
                const json = editor.get();
                const str = JSON.stringify(json, null, 2);
                const blob = new Blob([str], {type: 'application/json'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `json_data_${new Date().toISOString().slice(0,19)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                updateStatus('✅ Сохранено в файл');
            } catch (err) {
                updateStatus('❌ Ошибка сохранения: ' + err.message, true);
            }
        };
    }
    
    const loadBtn = document.getElementById('btn-load');
    const fileInput = document.getElementById('file-input');
    if (loadBtn && fileInput) {
        loadBtn.onclick = () => {
            fileInput.click();
        };
        
        fileInput.onchange = (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const jsonData = JSON.parse(e.target.result);
                    editor.set(jsonData);
                    updateStatus(`✅ Загружен файл: ${file.name}`);
                } catch (err) {
                    updateStatus('❌ Ошибка парсинга JSON', true);
                    alert('Неверный формат JSON: ' + err.message);
                }
            };
            reader.readAsText(file, 'UTF-8');
            fileInput.value = '';
        };
    }
    
    const expandBtn = document.getElementById('btn-expand');
    if (expandBtn) {
        expandBtn.onclick = () => {
            editor.expandAll();
            updateStatus('✅ Все узлы развёрнуты');
        };
    }
    
    const collapseBtn = document.getElementById('btn-collapse');
    if (collapseBtn) {
        collapseBtn.onclick = () => {
            editor.collapseAll();
            updateStatus('✅ Все узлы свёрнуты');
        };
    }
    
    const copyBtn = document.getElementById('btn-copy');
    if (copyBtn) {
        copyBtn.onclick = async () => {
            try {
                const json = editor.get();
                const str = JSON.stringify(json, null, 2);
                await navigator.clipboard.writeText(str);
                updateStatus('✅ JSON скопирован в буфер');
            } catch (err) {
                updateStatus('❌ Ошибка копирования', true);
            }
        };
    }
    
    const clearBtn = document.getElementById('btn-clear');
    if (clearBtn) {
        clearBtn.onclick = () => {
            if (confirm('Очистить полностью? Отменить нельзя.')) {
                editor.set({});
                updateStatus('✅ JSON очищен');
            }
        };
    }
});

window.getEditor = () => editor;