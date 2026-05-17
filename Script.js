// =========================================================================
// SIKLUS KEAMANAN UTAMA: WAJIB DI ATAS AGAR HALAMAN DIBLOKIR SEBELUM RENDERING
// =========================================================================
if (sessionStorage.getItem("savana_admin_logged") !== "true") {
  window.location.href = "login.html";
}

// ----- KONFIGURASI FIREBASE ASLI SAVANA (VERSI BROWSER STATIS) -----
const firebaseConfig = {
  apiKey: "AIzaSyCtv7DRnNXZDBQkXSrbKp1_IjAPk0RHDz8",
  authDomain: "savana-nota.firebaseapp.com",
  projectId: "savana-nota",
  storageBucket: "savana-nota.firebasestorage.app",
  messagingSenderId: "446565819313",
  appId: "1:446565819313:web:a25db60a26f58231c01390",
  measurementId: "G-T562G6FF1T",
  databaseURL:
    "https://savana-nota-default-rtdb.asia-southeast1.firebasedatabase.app/",
};

// Inisialisasi Firebase secara Global agar terbaca oleh semua fungsi di bawahnya
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

document.addEventListener("DOMContentLoaded", () => {
  // ----- KONFIGURASI DAN DATA -----
  const items = [
    // Tenda
    { id: "A001", name: "Tenda Double Layer 2P", price: 19000, type: "rental" },
    { id: "A002", name: "Tenda Double Layer 4P", price: 29000, type: "rental" },
    { id: "A003", name: "Tenda Double Layer 6P", price: 49000, type: "rental" },
    // Tas
    { id: "B001", name: "Carrier 45L", price: 12000, type: "rental" },
    { id: "B002", name: "Carrier 60L", price: 15000, type: "rental" },
    { id: "B003", name: "Daypack", price: 8000, type: "rental" },
    { id: "B004", name: "Hidropack", price: 8000, type: "rental" },
    // Peralatan Masak & Api
    { id: "C001", name: "Kompor Kotak", price: 5000, type: "rental" },
    { id: "C002", name: "Kompor Bunga", price: 6000, type: "rental" },
    { id: "C003", name: "Kompor Portable", price: 15000, type: "rental" },
    { id: "C004", name: "Cooking Set", price: 6000, type: "rental" },
    { id: "C005", name: "Grill Pan", price: 10000, type: "rental" },
    { id: "C006", name: "Gas Refill", price: 5000, type: "rental" },
    { id: "C007", name: "Gas Portable", price: 10000, type: "rental" },
    // Alas & Pelindung
    { id: "D001", name: "Matras biasa", price: 4000, type: "rental" },
    {
      id: "D002",
      name: "Matras Alumunium foil besar",
      price: 9000,
      type: "rental",
    },
    { id: "D003", name: "Flysheet", price: 9000, type: "rental" },
    // Furnitur Camping
    { id: "D004", name: "Meja", price: 15000, type: "rental" },
    { id: "D005", name: "Kursi", price: 10000, type: "rental" },
    // Penerangan
    { id: "E001", name: "Headlamp", price: 5000, type: "rental" },
    { id: "E002", name: "Senter", price: 5000, type: "rental" },
    { id: "E003", name: "Lampu tenda", price: 5000, type: "rental" },
    // Perlengkapan Pendakian & Pribadi
    { id: "F001", name: "Tracking pole", price: 9000, type: "rental" },
    { id: "F002", name: "Sarung tangan", price: 8000, type: "rental" },
    { id: "F003", name: "Jaket", price: 18000, type: "rental" },
    { id: "F004", name: "Sepatu", price: 20000, type: "rental" },
    { id: "F005", name: "Topi", price: 5000, type: "rental" },
    { id: "F006", name: "Sleeping Bag", price: 8000, type: "rental" },
    { id: "F007", name: "Baterai", price: 5000, type: "rental" },
    // Paket Sewa (Diasumsikan harga per hari untuk bundel)
    { id: "G01", name: "CAMPCER AP", price: 45000, type: "rental" },
    { id: "G02", name: "CAMPCER BP", price: 75000, type: "rental" },
    { id: "H01", name: "GLAMPING AP", price: 95000, type: "rental" },
    { id: "PG01", name: "GLAMPING BP", price: 105000, type: "rental" },
    { id: "PH02", name: "MASAK (Paket Sewa)", price: 15000, type: "rental" },
    {
      id: "PI01",
      name: "GRILL Set (Paket Sewa)",
      price: 25000,
      type: "rental",
    },
    { id: "PI02", name: "KUME (Paket Sewa)", price: 50000, type: "rental" },
    // Paket Trip Bromo (Harga tetap per paket)
    { id: "J01", name: "PRIVATE AT (Trip)", price: 2250000, type: "package" },
    { id: "J02", name: "PRIVATE BT (Trip)", price: 2000000, type: "package" },
    { id: "J03", name: "PRIVATE DT (Trip)", price: 1800000, type: "package" },
    { id: "J04", name: "PRIVATE ET (Trip)", price: 1600000, type: "package" },
    { id: "K01", name: "PAKET AT (Trip)", price: 325000, type: "package" },
    { id: "K02", name: "PAKET BT (Trip)", price: 375000, type: "package" },
    { id: "SH01", name: "Shuttle (Trip)", price: 200000, type: "package" },
  ];

  let allTransactions = [];
  let currentOrderItems = [];
  let currentTotalAmount = 0;
  let incomeChartInstance = null;

  // ----- SELEKSI ELEMEN DOM -----
  const customerNameInput = document.getElementById("customerName");
  const pickupDateInput = document.getElementById("pickupDate");
  const itemSelect = document.getElementById("itemSelect");
  const itemQuantityInput = document.getElementById("itemQuantity");
  const itemDurationInput = document.getElementById("itemDuration");
  const addItemButton = document.getElementById("addItemButton");
  const orderedItemsList = document.getElementById("orderedItemsList");
  const discountInput = document.getElementById("discountAmount");
  const subTotalAmountTextSpan = document.getElementById("subTotalAmountText");
  const discountAmountTextSpan = document.getElementById("discountAmountText");
  const grandTotalAmountTextSpan = document.getElementById(
    "grandTotalAmountText",
  );
  const finalizeTransactionButton = document.getElementById(
    "finalizeTransactionButton",
  );
  const receiptModal = document.getElementById("receiptModal");
  const closeButton = document.querySelector(".close-button");
  const receiptOutput = document.getElementById("receiptOutput");
  const printReceiptButton = document.getElementById("printReceiptButton");
  const customerEmailInput = document.getElementById("customerEmail");
  const emailReceiptButton = document.getElementById("emailReceiptButton");
  const reportMonthInput = document.getElementById("reportMonth");
  const generateReportButton = document.getElementById("generateReportButton");
  const reportOutputContainer = document.getElementById("reportOutput");
  const reportMonthYearText = document.getElementById("reportMonthYearText");
  const reportGeneratedDate = document.getElementById("reportGeneratedDate");
  const reportTotalRevenue = document.getElementById("reportTotalRevenue");
  const reportTotalTransactions = document.getElementById(
    "reportTotalTransactions",
  );
  const reportTopItem = document.getElementById("reportTopItem");
  const incomeChartCanvas = document
    .getElementById("incomeChart")
    .getContext("2d");
  const downloadCsvButton = document.getElementById("downloadCsvButton");
  const downloadPngButton = document.getElementById("downloadPngButton");
  const printReportButton = document.getElementById("printReportButton");
  const logoutBtn = document.getElementById("logoutBtn"); // Deklarasikan agar tidak memicu ReferenceError

  // ----- FUNGSI INTI & PEMBANTU (INTEGRASI CLOUD FIREBASE) -----

  // MENYIMPAN TRANSAKSI BARU LANGSUNG KE FIREBASE
  const saveTransactionsToLocalStorage = (newTx) => {
    database.ref("transactions/" + newTx.id).set(newTx, (error) => {
      if (error) {
        alert("Gagal menyimpan ke Cloud Database: " + error.message);
      } else {
        alert(`Transaksi ${newTx.id} berhasil disimpan secara Real-time!`);
      }
    });
  };

  // MENDENGARKAN DAN MENYINKRONKAN DATA FIREBASE SECARA REAL-TIME MULTI-DEVICE
  const listenToFirebaseTransactions = () => {
    database.ref("transactions").on("value", (snapshot) => {
      const data = snapshot.val();
      allTransactions = [];
      if (data) {
        Object.keys(data).forEach((key) => {
          allTransactions.push(data[key]);
        });
      }
      console.log(
        "Data Firebase tersinkronisasi. Total transaksi terdata:",
        allTransactions.length,
      );
    });
  };

  const getFormattedDate = (dateString) => {
    if (!dateString) return "Belum diatur";
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const correctedDate = new Date(date.getTime() + userTimezoneOffset);
    return correctedDate.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getTodayDateString = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const updateTotalDisplay = () => {
    let discountValue = parseFloat(discountInput.value) || 0;
    if (discountValue < 0) {
      discountValue = 0;
      discountInput.value = 0;
    }
    if (discountValue > currentTotalAmount) {
      discountValue = currentTotalAmount;
      discountInput.value = discountValue;
    }
    const grandTotal = currentTotalAmount - discountValue;
    subTotalAmountTextSpan.textContent =
      currentTotalAmount.toLocaleString("id-ID");
    discountAmountTextSpan.textContent = discountValue.toLocaleString("id-ID");
    grandTotalAmountTextSpan.textContent = grandTotal.toLocaleString("id-ID");
  };

  const renderOrderedItems = () => {
    orderedItemsList.innerHTML = "";
    currentOrderItems.forEach((item, index) => {
      const listItem = document.createElement("li");
      let durationText =
        item.type === "rental" ? ` (${item.duration} hari)` : ` (Paket)`;
      listItem.innerHTML = `
                <span>${item.quantity}x ${item.name}${durationText}</span>
                <span>Rp ${item.subtotal.toLocaleString("id-ID")}</span>
                <button class="remove-item-btn" data-index="${index}">Hapus</button>
            `;
      orderedItemsList.appendChild(listItem);
    });
    document.querySelectorAll(".remove-item-btn").forEach((button) => {
      button.addEventListener("click", (e) =>
        removeItemFromOrder(parseInt(e.target.dataset.index)),
      );
    });
  };

  const removeItemFromOrder = (index) => {
    const removedItem = currentOrderItems.splice(index, 1)[0];
    if (removedItem) currentTotalAmount -= removedItem.subtotal;
    renderOrderedItems();
    updateTotalDisplay();
  };

  const addItemToCurrentOrder = () => {
    const selectedItemId = itemSelect.value;
    const quantity = parseInt(itemQuantityInput.value);
    let duration = parseInt(itemDurationInput.value);
    const selectedItem = items.find((item) => item.id === selectedItemId);
    if (!selectedItem) {
      alert("Silakan pilih barang/jasa.");
      return;
    }
    if (isNaN(quantity) || quantity <= 0) {
      alert("Jumlah harus lebih dari 0.");
      return;
    }
    if (isNaN(duration) || duration < 0) {
      alert("Durasi tidak valid.");
      return;
    }
    let itemSubtotal;
    let effectiveDuration = duration;
    if (selectedItem.type === "package") {
      effectiveDuration = 1;
      itemSubtotal = selectedItem.price * quantity;
      if (duration === 0 && itemDurationInput.value === "0")
        itemDurationInput.value = 1;
    } else {
      if (duration === 0) {
        effectiveDuration = 1;
        if (itemDurationInput.value === "0") itemDurationInput.value = 1;
      }
      itemSubtotal = selectedItem.price * quantity * effectiveDuration;
    }
    currentOrderItems.push({
      id: selectedItem.id,
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: quantity,
      duration: effectiveDuration,
      type: selectedItem.type,
      subtotal: itemSubtotal,
    });
    currentTotalAmount += itemSubtotal;
    renderOrderedItems();
    updateTotalDisplay();
  };

  const resetCurrentOrderForm = () => {
    currentOrderItems = [];
    currentTotalAmount = 0;
    customerNameInput.value = "";
    pickupDateInput.value = getTodayDateString();
    itemQuantityInput.value = 1;
    itemDurationInput.value = 1;
    discountInput.value = 0;
    renderOrderedItems();
    updateTotalDisplay();
  };

  const displayReceipt = (transaction) => {
    const {
      id,
      transactionDate,
      customer,
      pickupDate,
      items,
      subtotal,
      discount,
      grandTotal,
    } = transaction;
    let receiptHTML = `
            <div class="receipt-content-on-screen">
                <img src="savana_logo.png" alt="Savana Adventrip Logo" id="receiptLogo">
                <div class="receipt-header">
                    <p class="business-name">Savana Adventrip</p>
                    <p class="address-line"><span class="icon">🏠</span> Jl. Raya Candi II No.236, Karangbesuki, Sukun, Kota Malang, Jawa Timur 65149</p>
                    <p class="contact-line"><span class="icon">📞</span> Telp/WA: 0859-2324-3303 <span style="margin: 0 5px;">|</span> <span class="icon">📷</span> IG: @savanaadventripmalang</p>
                </div>
                <div class="receipt-details">
                    <p><strong>Nota ID</strong>: ${id}</p>
                    <p><strong>Tgl. Transaksi</strong>: ${new Date(transactionDate).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })} ${new Date(transactionDate).toLocaleTimeString("id-ID")}</p>
                    <p><strong>Pelanggan</strong>: ${customer}</p>
                    <p><strong>Tgl. Pengambilan/Trip</strong>: ${getFormattedDate(pickupDate)}</p>
                </div>
                <h4>Rincian Pesanan:</h4>
                <table>
                    <thead>
                        <tr>
                            <th>Barang/Jasa</th>
                            <th>Harga</th>
                            <th>Jml</th>
                            <th>Durasi</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>`;
    items.forEach((item) => {
      let durationDisplay =
        item.type === "rental" ? `${item.duration} hari` : `Paket`;
      receiptHTML += `
                <tr>
                    <td>${item.name}</td>
                    <td>Rp ${item.price.toLocaleString("id-ID")}</td>
                    <td>${item.quantity}</td>
                    <td>${durationDisplay}</td>
                    <td>Rp ${item.subtotal.toLocaleString("id-ID")}</td>
                </tr>`;
    });
    receiptHTML += `
                    </tbody>
                </table>
                <div class="receipt-totals-section">
                    <p><span>Subtotal:</span> <span>Rp ${subtotal.toLocaleString("id-ID")}</span></p>`;
    if (discount > 0) {
      receiptHTML += `<p><span>Diskon:</span> <span>- Rp ${discount.toLocaleString("id-ID")}</span></p>`;
    }
    receiptHTML += `<p class="grand-total"><strong>TOTAL BAYAR:</strong> <span><strong>Rp ${grandTotal.toLocaleString("id-ID")}</strong></span></p>
                </div>
                <div class="footer-notes">
                    <p>Terima kasih atas kepercayaan Anda kepada Savana Adventrip!</p>
                    <p>Simpan nota ini sebagai bukti transaksi yang sah.</p>
                </div>
            </div>`;
    receiptOutput.innerHTML = receiptHTML;
    receiptModal.style.display = "block";
  };

  const finalizeAndSaveTransaction = () => {
    if (currentOrderItems.length === 0) {
      alert("Tidak ada item untuk disimpan.");
      return;
    }
    let discountValue = parseFloat(discountInput.value) || 0;
    if (discountValue < 0) discountValue = 0;
    discountValue = Math.min(discountValue, currentTotalAmount);
    const grandTotal = currentTotalAmount - discountValue;
    const transactionDate = new Date();
    const receiptId = `SA${transactionDate.getFullYear().toString().slice(-2)}${(transactionDate.getMonth() + 1).toString().padStart(2, "0")}${transactionDate.getDate().toString().padStart(2, "0")}-${transactionDate.getHours().toString().padStart(2, "0")}${transactionDate.getMinutes().toString().padStart(2, "0")}`;

    const newTransaction = {
      id: receiptId,
      transactionDate: transactionDate.toISOString(),
      customer: customerNameInput.value || "Pelanggan",
      pickupDate: pickupDateInput.value,
      items: [...currentOrderItems],
      subtotal: currentTotalAmount,
      discount: discountValue,
      grandTotal: grandTotal,
      status: "Disewa",
    };

    saveTransactionsToLocalStorage(newTransaction);
    displayReceipt(newTransaction);
    resetCurrentOrderForm();
  };

  // ----- LOGIKA LAPORAN -----
  const generateMonthlyReport = () => {
    if (!reportMonthInput.value) {
      alert("Silakan pilih bulan dan tahun laporan.");
      return;
    }
    const [year, month] = reportMonthInput.value.split("-").map(Number);
    const transactionsInMonth = allTransactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
    });
    if (transactionsInMonth.length === 0) {
      alert(
        `Tidak ada transaksi yang ditemukan untuk bulan ${reportMonthInput.value}.`,
      );
      reportOutputContainer.classList.add("hidden");
      return;
    }
    const totalRevenue = transactionsInMonth.reduce(
      (sum, tx) => sum + tx.grandTotal,
      0,
    );
    const totalTransactions = transactionsInMonth.length;
    const itemCounts = transactionsInMonth
      .flatMap((tx) => tx.items)
      .reduce((acc, item) => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
        return acc;
      }, {});
    const topItem = Object.entries(itemCounts).sort(
      (a, b) => b[1] - a[1],
    )[0] || ["-", 0];
    const revenueByDay = transactionsInMonth.reduce((acc, tx) => {
      const day = new Date(tx.transactionDate).getDate();
      acc[day] = (acc[day] || 0) + tx.grandTotal;
      return acc;
    }, {});
    const monthName = new Date(year, month - 1).toLocaleString("id-ID", {
      month: "long",
      year: "numeric",
    });

    reportMonthYearText.textContent = monthName;
    reportGeneratedDate.textContent = new Date().toLocaleString("id-ID");
    reportTotalRevenue.textContent = `Rp ${totalRevenue.toLocaleString("id-ID")}`;
    reportTotalTransactions.textContent = totalTransactions;
    reportTopItem.textContent = `${topItem[0]} (${topItem[1]}x)`;
    renderReportChart(revenueByDay, year, month);
    reportOutputContainer.classList.remove("hidden");
  };

  const renderReportChart = (revenueByDay, year, month) => {
    if (incomeChartInstance) {
      incomeChartInstance.destroy();
    }
    const daysInMonth = new Date(year, month, 0).getDate();
    const labels = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const data = labels.map((day) => revenueByDay[day] || 0);
    incomeChartInstance = new Chart(incomeChartCanvas, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Pendapatan Harian (Rp)",
            data: data,
            backgroundColor: "rgba(151, 191, 13, 0.6)",
            borderColor: "rgba(126, 171, 60, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return "Rp " + value.toLocaleString("id-ID");
              },
            },
          },
        },
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: true, text: `Grafik Pendapatan Harian` },
        },
      },
    });
  };

  const downloadAsCsv = () => {
    if (!reportMonthInput.value) {
      alert("Silakan pilih bulan dan tahun laporan terlebih dahulu.");
      return;
    }
    const [year, month] = reportMonthInput.value.split("-").map(Number);
    const transactionsInMonth = allTransactions.filter((tx) => {
      const txDate = new Date(tx.transactionDate);
      return txDate.getFullYear() === year && txDate.getMonth() + 1 === month;
    });
    if (transactionsInMonth.length === 0) {
      alert(
        `Tidak ada data transaksi untuk diunduh pada bulan ${reportMonthInput.value}.`,
      );
      return;
    }
    let csvRows = [];
    const headers = [
      "ID Nota",
      "Tanggal Transaksi",
      "Waktu Transaksi",
      "Pelanggan",
      "Tgl Ambil/Trip",
      "Kode Barang",
      "Nama Barang",
      "Harga Satuan",
      "Jumlah",
      "Durasi (hari)",
      "Subtotal Item",
      "Diskon per Nota",
      "Total Akhir Nota",
    ];
    csvRows.push(headers.join(","));
    const escapeCsvCell = (cell) => {
      if (cell === null || cell === undefined) return '""';
      const cellString = String(cell);
      if (
        cellString.includes(",") ||
        cellString.includes('"') ||
        cellString.includes("\n")
      ) {
        return `"${cellString.replace(/"/g, '""')}"`;
      }
      return cellString;
    };
    for (const tx of transactionsInMonth) {
      const txDate = new Date(tx.transactionDate);
      const date = txDate.toLocaleDateString("id-ID");
      const time = txDate.toLocaleTimeString("id-ID");
      for (const item of tx.items) {
        const row = [
          tx.id,
          date,
          time,
          tx.customer,
          tx.pickupDate,
          item.id,
          item.name,
          item.price,
          item.quantity,
          item.duration,
          item.subtotal,
          tx.discount,
          tx.grandTotal,
        ];
        csvRows.push(row.map(escapeCsvCell).join(","));
      }
    }
    const csvContent = csvRows.join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `laporan-data-savana-${reportMonthInput.value}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAsPng = () => {
    const reportElement = document.getElementById("reportOutput");
    if (reportElement.classList.contains("hidden")) {
      alert("Silakan buat laporan terlebih dahulu sebelum mengunduh.");
      return;
    }
    html2canvas(reportElement, { backgroundColor: "#fdfdfd" }).then(
      (canvas) => {
        const link = document.createElement("a");
        link.download = `laporan-savana-adventrip-${reportMonthInput.value}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      },
    );
  };

  // ----- EVENT LISTENERS -----
  addItemButton.addEventListener("click", addItemToCurrentOrder);
  finalizeTransactionButton.addEventListener(
    "click",
    finalizeAndSaveTransaction,
  );
  discountInput.addEventListener("input", updateTotalDisplay);

  closeButton.addEventListener("click", () => {
    receiptModal.style.display = "none";
  });
  window.onclick = (event) => {
    if (event.target == receiptModal) {
      receiptModal.style.display = "none";
    }
  };

  generateReportButton.addEventListener("click", generateMonthlyReport);
  downloadCsvButton.addEventListener("click", downloadAsCsv);
  downloadPngButton.addEventListener("click", downloadAsPng);

  // LOGIKA EVENT LOGOUT
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      if (confirm("Apakah Anda yakin ingin keluar dari sistem admin Savana?")) {
        sessionStorage.removeItem("savana_admin_logged");
        window.location.href = "login.html";
      }
    });
  }

  // EVENT PRINT NOTA (A5 Iframe Resmi Pembawa Gaya Kustom Anda)
  printReceiptButton.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    const pri = iframe.contentWindow;
    pri.document.open();
    pri.document.write(
      "<html><head><title>Cetak Nota Savana Adventrip</title>",
    );
    pri.document.write('<style type="text/css">');
    pri.document.write(`
        @page { size: A5 portrait; margin: 10mm 8mm; }
        *, *::before, *::after { box-sizing: border-box; -webkit-print-color-adjust: exact !important; color-adjust: exact !important; }
        body { font-family: sans-serif; font-size: 9pt; line-height: 1.4; color: #2d2d2d; margin: 0; }
        .receipt-print-wrapper { width: 100%; margin: 0 auto; }
        #receiptLogo { display: block; margin: 0 auto 10px auto; max-width: 120px; }
        .receipt-header { text-align: center; margin-bottom: 10px; }
        .receipt-header .business-name { font-size: 14pt; font-weight: bold; margin: 0; }
        .receipt-header .address-line, .receipt-header .contact-line { font-size: 7.5pt; color: #555; margin: 2px 0; }
        .receipt-details { margin-bottom: 10px; font-size: 8.5pt; border-bottom: 1px dashed #000; padding-bottom: 5px; }
        table { width: 100%; border-collapse: collapse; font-size: 8.5pt; margin-bottom: 10px; }
        th, td { padding: 5px 2px; border-bottom: 1px solid #eee; }
        th { font-weight: bold; background: #f5f5f5; }
        .receipt-totals-section { text-align: right; font-size: 9pt; border-top: 1px solid #000; padding-top: 5px; }
        .grand-total { font-size: 11pt; font-weight: bold; color: #97BF0D; }
        .footer-notes { text-align: center; font-size: 7.5pt; color: #777; margin-top: 15px; }
    `);
    pri.document.write("</style></head><body>");
    pri.document.write('<div class="receipt-print-wrapper">');
    pri.document.write(receiptOutput.innerHTML);
    pri.document.write("</div></body></html>");
    pri.document.close();
    setTimeout(() => {
      pri.focus();
      pri.print();
      document.body.removeChild(iframe);
    }, 500);
  });

  // EVENT PRINT LAPORAN BULANAN (A4 Iframe Resmi Pembawa Gaya Kustom Anda)
  printReportButton.addEventListener("click", () => {
    const reportElement = document.getElementById("reportOutput");
    if (reportElement.classList.contains("hidden")) {
      alert("Silakan buat laporan terlebih dahulu sebelum mencetak.");
      return;
    }
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.width = "1px";
    iframe.style.height = "1px";
    iframe.style.opacity = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);
    const pri = iframe.contentWindow;
    pri.document.open();
    pri.document.write("<html><head><title>Cetak Laporan Bulanan</title>");
    pri.document.write('<style type="text/css">');
    pri.document.write(`
        @page { size: A4 portrait; margin: 15mm; }
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
        .report-download-buttons { display: none !important; }
        .report-header h3 { font-size: 16pt; text-align: center; }
        .report-summary-cards { display: flex; justify-content: space-between; gap: 10px; margin: 20px 0; }
        .card { flex: 1; border: 1px solid #ddd; padding: 10px; text-align: center; background: #fafafa; }
        .report-chart-container { text-align: center; margin-top: 25px; }
        canvas { max-width: 100% !important; }
    `);
    pri.document.write("</style></head><body>");
    pri.document.write(reportElement.innerHTML);
    pri.document.write("</body></html>");
    pri.document.close();
    setTimeout(() => {
      pri.focus();
      pri.print();
      document.body.removeChild(iframe);
    }, 500);
  });

  // ----- INISIALISASI JALUR UTAMA APLIKASI -----

  // 1. ISI DATA BARANG/JASA KE DROPDOWN SEJAK HALAMAN DIBUKA
  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    let displayText = `${item.name} - Rp ${item.price.toLocaleString("id-ID")}`;
    displayText += item.type === "rental" ? "/hari" : "/paket";
    option.textContent = displayText;
    itemSelect.appendChild(option);
  });

  // 2. SET VALUE DEFAULT TANGGAL FORM
  pickupDateInput.value = getTodayDateString();
  reportMonthInput.value = getTodayDateString().substring(0, 7);

  // 3. AKTIFKAN PENDENGAR CLOUD DATABASE SEBAGAI PROSES AKHIR
  listenToFirebaseTransactions();
});
