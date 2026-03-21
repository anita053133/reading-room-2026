const form = document.getElementById('signupForm');
const submitBtn = document.getElementById('submitBtn');
const successMessage = document.getElementById('successMessage');

// Google Apps Script Deploy URL (更新為新版本連結)
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw3XvNWPS42xA8s0sv6stZ5n75SvHPb-P5lURVl71ocAYgbQceMNdGJAyrv8XlvvfPj/exec';

document.addEventListener('DOMContentLoaded', checkExpiredSessions);

function checkExpiredSessions() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const checkboxes = document.querySelectorAll('input[name="session"]');
    checkboxes.forEach(cb => {
        const val = cb.value;
        const match = val.match(/^(\d{1,2})\/(\d{1,2})/);
        if (match) {
            // 根據網站標題使用年份 2026
            const eventDate = new Date(2026, parseInt(match[1], 10) - 1, parseInt(match[2], 10));

            if (eventDate < today) {
                cb.disabled = true;
                const label = cb.closest('.checkbox-item');
                if (label) {
                    label.classList.add('expired');
                }
            }
        }
    });
}

form.addEventListener('submit', function (e) {
    e.preventDefault(); // 防止預設送出

    // 1. 取得表單資料
    const formData = new FormData(form);

    // 2. 處理 Checkbox 多選資料
    // 取得所有被勾選的 input[name="session"] 元素
    const checkedSessions = form.querySelectorAll('input[name="session"]:checked');

    // 驗證：如果沒有勾選任何場次，阻止送出並提示
    if (checkedSessions.length === 0) {
        alert('請至少選擇一個您想參加的場次 (或選取「以上都會參加」)。');
        return; // 中斷函式，不往下執行
    }

    // 將所有勾選的 value 收集成陣列，再用逗號連接成字串
    // 例如: "2/25 (三)..., 4/09 (四)..."
    const sessionValues = Array.from(checkedSessions).map(cb => cb.value).join(', ');

    // 3. 準備要傳送的資料
    // 將順序完全對齊 Google Sheet 的欄位，避免跑版
    const payload = {
        name: formData.get('name'),               // 1. 如何稱呼你
        session: sessionValues,                   // 2. 報名場次
        age_job: formData.get('age_job'),         // 3. 年紀與職業
        recommender: formData.get('recommender'), // 4. 推薦人
        expectation: formData.get('expectation'), // 5. 期待
        email: formData.get('email'),             // 6. 電子信箱
        note: formData.get('note')                // 7. 其他補充
    };

    // 4. 鎖定按鈕，顯示載入中
    submitBtn.disabled = true;
    submitBtn.textContent = '傳送中...';

    // 5. 發送資料到 Google Apps Script
    fetch(SCRIPT_URL, {
        method: 'POST',
        body: JSON.stringify(payload)
    })
        .then(response => {
            console.log('Success:', response);
            showSuccessView();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('發生錯誤，請檢查網路連線或稍後再試。\n' + error);
            submitBtn.disabled = false;
            submitBtn.textContent = '送出報名';
        });
});

function showSuccessView() {
    // 隱藏表單
    const formSection = document.getElementById('signup');
    form.style.display = 'none';
    formSection.querySelector('.form-desc').style.display = 'none'; // 隱藏描述文字

    // 顯示成功訊息
    successMessage.style.display = 'block';

    // 捲動到成功訊息 (稍微上移一點)
    const yOffset = -100;
    const y = formSection.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
}
