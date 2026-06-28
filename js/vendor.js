// js/vendor.js - Vendor Dashboard with 2-step Restaurant Modal + Floor Plan Editor

function downloadVendorPDF() {
    const btn = document.getElementById('exportPdfBtn');
    const orig = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Generating...';

    const rests = document.getElementById('statRests').innerText;
    const res   = document.getElementById('statReservations').innerText;
    const pend  = document.getElementById('statPendingRests').innerText;

    const printDiv = document.createElement('div');
    printDiv.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:800px;background:#fff;color:#000;padding:40px;font-family:Arial,sans-serif;';
    printDiv.innerHTML = `
        <div style="text-align:center;margin-bottom:30px;border-bottom:2px solid #ccc;padding-bottom:20px;">
            <h1 style="margin:0;font-size:28px;color:#333;">ReserveHub &mdash; Vendor Analytics Report</h1>
            <p style="margin:5px 0 0;font-size:14px;color:#666;">Generated on: ${new Date().toLocaleString()}</p>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:40px;">
            <div style="text-align:center;flex:1;border:1px solid #ddd;padding:20px;margin:0 10px;border-radius:8px;">
                <h3 style="margin:0;font-size:16px;color:#555;text-transform:uppercase;">My Restaurants</h3>
                <p style="margin:10px 0 0;font-size:32px;font-weight:bold;color:#000;">${rests}</p>
            </div>
            <div style="text-align:center;flex:1;border:1px solid #ddd;padding:20px;margin:0 10px;border-radius:8px;">
                <h3 style="margin:0;font-size:16px;color:#555;text-transform:uppercase;">Total Reservations</h3>
                <p style="margin:10px 0 0;font-size:32px;font-weight:bold;color:#000;">${res}</p>
            </div>
            <div style="text-align:center;flex:1;border:1px solid #ddd;padding:20px;margin:0 10px;border-radius:8px;">
                <h3 style="margin:0;font-size:16px;color:#555;text-transform:uppercase;">Pending Approvals</h3>
                <p style="margin:10px 0 0;font-size:32px;font-weight:bold;color:#000;">${pend}</p>
            </div>
        </div>
    `;
    document.body.appendChild(printDiv);

    html2canvas(printDiv, { backgroundColor: '#fff', scale: 2, useCORS: true, logging: false })
        .then(canvas => {
            const { jsPDF } = window.jspdf;
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const w = pdf.internal.pageSize.getWidth();
            pdf.addImage(imgData, 'PNG', 0, 0, w, (canvas.height * w) / canvas.width);
            pdf.save('ReserveHub_Vendor_Report.pdf');
            document.body.removeChild(printDiv);
            btn.disabled = false; btn.innerHTML = orig;
        }).catch(err => {
            console.error('PDF generation failed:', err);
            if (document.body.contains(printDiv)) document.body.removeChild(printDiv);
            btn.disabled = false; btn.innerHTML = orig;
        });
}

document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. MODAL + FLOOR PLAN STATE (defined FIRST)
    // =========================================================
    let currentRestId = null;   // ID of restaurant being added/edited
    let vFloorTables  = [];     // { id, table_number, capacity, shape, x_pos, y_pos, _new, _dirty, _delete }
    let vSelectedId   = null;
    let vDragState    = null;
    let vNextTempId   = -1;

    // ── Open modal (add new) ──
    window.openRestaurantModal = () => {
        currentRestId = null;
        vFloorTables  = [];
        vSelectedId   = null;

        const form = document.getElementById('restForm');
        if (form) form.reset();
        document.getElementById('restId').value         = '';
        document.getElementById('restModalTitle').innerText = 'Add New Restaurant';
        document.getElementById('restTableLayout') && (document.getElementById('restTableLayout').value = '');

        // Reset image preview
        const img = document.querySelector('#imagePreview img');
        const ph  = document.querySelector('#imagePreview .preview-placeholder');
        if (img) img.style.display = 'none';
        if (ph)  ph.style.display  = 'flex';
        const lbl = document.getElementById('fileLabelText');
        if (lbl) lbl.innerText = 'Choose Restaurant Image';

        document.getElementById('restModal').classList.add('show');
    };

    window.closeModal = (id) => {
        document.getElementById(id)?.classList.remove('show');
    };

    window.previewImage = (input) => {
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.querySelector('#imagePreview img');
                const ph  = document.querySelector('#imagePreview .preview-placeholder');
                if (img) { img.src = e.target.result; img.style.display = 'block'; }
                if (ph)  ph.style.display = 'none';
                const lbl = document.getElementById('fileLabelText');
                if (lbl) lbl.innerText = input.files[0].name;
            };
            reader.readAsDataURL(input.files[0]);
        }
    };

    // Close modal on backdrop click
    document.getElementById('restModal')?.addEventListener('click', (e) => {
        if (e.target === document.getElementById('restModal')) window.closeModal('restModal');
    });

    // =========================================================
    // 2. AUTH / SESSION CHECK
    // =========================================================
    const userStr = localStorage.getItem('reservehub_user') || sessionStorage.getItem('reservehub_user');
    if (!userStr) { window.location.href = 'login-signup.html'; return; }

    let vendorUser;
    try {
        vendorUser = JSON.parse(userStr);
        if (vendorUser.role !== 'vendor') { window.location.href = 'index.html'; return; }
    } catch (e) { window.location.href = 'login-signup.html'; return; }

    const userId = vendorUser.id;
    const welcomeEl = document.getElementById('welcomeText');
    if (welcomeEl) welcomeEl.innerText = `Welcome back, ${vendorUser.name}!`;

    // =========================================================
    // 3. SIDEBAR NAVIGATION
    // =========================================================
    const navLinks = document.querySelectorAll('.admin-nav a[data-target]');
    const sections = document.querySelectorAll('.admin-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-target');
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            sections.forEach(sec => sec.classList.toggle('active', sec.id === target));
            if (target === 'dashboard')    loadStats();
            if (target === 'restaurants')  loadRestaurants();
            if (target === 'tables')       vLoadFloorPlanSection();
            if (target === 'reservations') loadReservations();
            if (target === 'history')      loadHistory();
        });
    });

    // =========================================================
    // 4. TOAST
    // =========================================================
    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        toast.className = `toast-notification ${type} show`;
        toast.innerText = message;
        setTimeout(() => toast.classList.remove('show'), 3500);
    }

    // =========================================================
    // 5. STATS
    // =========================================================
    let vendorRestaurants  = [];
    let vendorReservations = [];
    let vendorResChart = null;

    function loadStats() {
        Promise.all([
            fetch(`../api/vendor_api.php?endpoint=restaurants`).then(r => r.json()),
            fetch(`../api/vendor_api.php?endpoint=reservations`).then(r => r.json()),
            fetch(`../api/vendor_api.php?endpoint=reservation_history`).then(r => r.json())
        ]).then(([rr, resr, histr]) => {
            if (rr.success) {
                vendorRestaurants = rr.data || [];
                document.getElementById('statRests').innerText = vendorRestaurants.length;
            }
            const activeRes  = resr.success  ? (resr.data  || []) : [];
            const historyRes = histr.success ? (histr.data || []) : [];
            vendorReservations = activeRes;
            // Total = all reservations ever (active + past)
            document.getElementById('statReservations').innerText = activeRes.length + historyRes.length;
            // Pending Approvals = reservation requests awaiting vendor Accept/Cancel
            document.getElementById('statPendingRests').innerText = activeRes.filter(r => r.status === 'pending').length;
            // Chart uses all reservations (active + history) for accurate per-restaurant counts
            drawVendorChart([...activeRes, ...historyRes]);
        }).catch(err => { console.error(err); showToast('Failed to load stats.', 'error'); });
    }

    function drawVendorChart(allRes) {
        const source = allRes || vendorReservations;
        const restCounts = {};
        source.forEach(r => {
            const name = r.restaurant_name || 'Unknown';
            restCounts[name] = (restCounts[name] || 0) + 1;
        });
        
        const labels = Object.keys(restCounts);
        const data = Object.values(restCounts);
        
        if (vendorResChart) vendorResChart.destroy();
        
        const canvas = document.getElementById('vendorResChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        vendorResChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Reservations',
                    data: data,
                    backgroundColor: 'rgba(46, 204, 113, 0.8)',
                    borderColor: '#2ecc71',
                    borderWidth: 1,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: { backgroundColor: '#151515', titleColor: '#2ecc71', bodyColor: '#fff' }
                },
                scales: {
                    y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a0a0a0', stepSize: 1 } },
                    x: { grid: { display: false }, ticks: { color: '#a0a0a0' } }
                }
            }
        });
    }


    // =========================================================
    // 6. RESTAURANTS LIST
    // =========================================================
    function loadRestaurants() {
        const grid = document.getElementById('restGrid');
        if (!grid) return;
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--orange)"></i><br><br>Loading...</div>';
        fetch(`../api/vendor_api.php?endpoint=restaurants`)
            .then(r => r.json())
            .then(res => {
                if (res.success) { vendorRestaurants = res.data || []; renderRestaurants(vendorRestaurants); }
                else showToast(res.message, 'error');
            }).catch(() => showToast('Failed to load restaurants.', 'error'));
    }

    function renderRestaurants(list) {
        const grid = document.getElementById('restGrid');
        if (!grid) return;
        grid.innerHTML = '';
        if (list.length === 0) {
            grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px;background:var(--surface);border-radius:12px;border:1px dashed var(--glass-border);"><i class="fa-solid fa-utensils" style="font-size:48px;color:var(--text-muted);opacity:0.3;margin-bottom:16px;display:block;"></i><p style="color:var(--text-muted);margin-bottom:20px;">You haven't listed any restaurants yet.</p><button class="btn btn-primary" onclick="openRestaurantModal()">+ Add Your First Restaurant</button></div>`;
            return;
        }
        list.forEach(rest => {
            const card = document.createElement('div');
            card.className = 'admin-card';
            card.style.cssText = 'position:relative;overflow:hidden;border-radius:12px;';
            const statusClass = rest.status || 'pending';
            const imgUrl = rest.image_url || '';
            const imgStyle = imgUrl ? `background-image:url('${imgUrl}');` : 'background:linear-gradient(135deg,#ff6b2b,#e85520);';
            const isOpen = (rest.is_open === undefined || rest.is_open == 1);
            const openStatusHtml = isOpen 
                ? `<span style="background: #2ecc71; color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 8px;"><i class="fa-solid fa-door-open"></i> OPEN</span>` 
                : `<span style="background: #e74c3c; color: #fff; font-size: 11px; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 8px;"><i class="fa-solid fa-door-closed"></i> CLOSED</span>`;
            
            card.innerHTML = `
                <div style="position:absolute;top:12px;right:12px;z-index:10;"><span class="status-badge ${statusClass}">${statusClass}</span></div>
                <div style="${imgStyle}height:180px;background-size:cover;background-position:center;border-radius:12px 12px 0 0;display:flex;align-items:center;justify-content:center;">
                    ${!imgUrl ? '<i class="fa-solid fa-utensils" style="font-size:40px;color:rgba(255,255,255,0.6);"></i>' : ''}
                </div>
                <div style="padding:20px;">
                    <h3 style="margin-bottom:6px;font-size:17px;display:flex;align-items:center;">${escHtml(rest.name)} ${openStatusHtml}</h3>
                    <p style="color:var(--text-muted);font-size:13px;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${escHtml(rest.description || 'No description provided.')}</p>
                    <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-muted);margin-bottom:18px;">
                        <span><i class="fa-solid fa-utensils"></i> ${escHtml(rest.cuisine || '—')}</span>
                        <span><i class="fa-solid fa-location-dot"></i> ${escHtml(rest.location || '—')}</span>
                        <span><i class="fa-solid fa-clock"></i> ${rest.opening_time ? rest.opening_time.slice(0,5) : '—'}</span>
                    </div>
                    <div style="display:flex;gap:8px;margin-bottom:10px;">
                        <button class="btn btn-primary" style="flex:1;font-size:13px;background:${isOpen?'transparent':'#2ecc71'};border-color:${isOpen?'#e74c3c':'#2ecc71'};color:${isOpen?'#e74c3c':'#fff'};" onclick="toggleRestaurantOpen('${rest.id}', ${isOpen ? 0 : 1})">
                            <i class="fa-solid ${isOpen?'fa-door-closed':'fa-door-open'}"></i> Mark as ${isOpen?'Closed':'Open'}
                        </button>
                    </div>
                    <div style="display:flex;gap:8px;">
                        <button class="btn btn-primary" style="flex:1;font-size:13px;" onclick="editRestaurant('${rest.id}')"><i class="fa-solid fa-pen"></i> Edit</button>
                        <button class="btn btn-primary" style="flex:1;font-size:13px;" onclick="editFloorPlan('${rest.id}')"><i class="fa-solid fa-table-cells"></i> Floor</button>
                        <button class="btn btn-primary" style="flex:1;font-size:13px;background:transparent;border:1px solid #ff4757;color:#ff4757;" onclick="deleteRestaurant('${rest.id}')"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>`;
            grid.appendChild(card);
        });
    }

    function escHtml(s) { return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

    window.filterRestaurants = () => {
        const q = document.getElementById('searchRestaurants')?.value.toLowerCase() || '';
        renderRestaurants(vendorRestaurants.filter(r => (r.name||'').toLowerCase().includes(q) || (r.cuisine||'').toLowerCase().includes(q) || (r.location||'').toLowerCase().includes(q)));
    };

    window.toggleRestaurantOpen = (id, isOpen) => {
        fetch('../api/vendor_api.php?endpoint=toggle_open', { 
            method: 'POST', 
            headers: {'Content-Type':'application/json'}, 
            body: JSON.stringify({id, is_open: isOpen}) 
        })
        .then(r => r.json())
        .then(res => { 
            if(res.success){
                showToast(`Restaurant marked as ${isOpen ? 'Open 🟢' : 'Closed 🔴'}.`); 
                // Update local state immediately
                const rest = vendorRestaurants.find(r => r.id == id);
                if (rest) rest.is_open = isOpen;
                loadRestaurants();
                // If currently on the tables tab, reload the floor plan for this restaurant
                const tablesSection = document.getElementById('tables');
                if (tablesSection && tablesSection.classList.contains('active')) {
                    vLoadFloorPlanSection(id);
                }
            } else {
                showToast(res.message, 'error'); 
            }
        })
        .catch(() => showToast('Failed to update status.', 'error'));
    };

    // =========================================================
    // 7. RESERVATIONS
    // =========================================================
    function loadReservations() {
        const container = document.getElementById('resList');
        if (!container) return;
        container.innerHTML = '<div style="text-align:center;padding:40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--orange)"></i></div>';
        fetch(`../api/vendor_api.php?endpoint=reservations`)
            .then(r => r.json())
            .then(res => { if (res.success) { vendorReservations = res.data || []; renderReservations(vendorReservations); } else showToast(res.message, 'error'); })
            .catch(() => showToast('Failed to load reservations.', 'error'));
    }

    function renderReservations(list) {
        const c = document.getElementById('resList'); if (!c) return; c.innerHTML = '';
        if (list.length === 0) { c.innerHTML = `<div style="text-align:center;padding:60px;background:var(--surface);border-radius:12px;border:1px dashed var(--glass-border);"><i class="fa-solid fa-book" style="font-size:48px;color:var(--text-muted);opacity:0.3;display:block;margin-bottom:16px;"></i><p style="color:var(--text-muted);">No reservations yet.</p></div>`; return; }
        list.forEach(res => {
            const card = document.createElement('div'); card.className = 'admin-card';
            card.style.cssText = 'display:flex;flex-direction:row;align-items:center;padding:20px;gap:20px;flex-wrap:wrap;';
            const sc = res.status === 'confirmed' ? 'approved' : (res.status === 'pending' ? 'pending' : 'rejected');
            card.innerHTML = `<div style="flex:1;min-width:220px;"><div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;"><span class="status-badge ${sc}">${res.status}</span><span style="font-size:12px;color:var(--text-muted);"><i class="fa-solid fa-store"></i> ${escHtml(res.restaurant_name)}</span></div><h3 style="margin-bottom:4px;">${escHtml(res.user_name)}</h3><p style="color:var(--text-muted);font-size:13px;"><i class="fa-solid fa-phone"></i> ${escHtml(res.user_phone||'—')}</p></div><div style="flex:1;min-width:180px;font-size:14px;display:flex;flex-direction:column;gap:6px;"><div><i class="fa-solid fa-calendar"></i> <strong>Date:</strong> ${res.date}</div><div><i class="fa-solid fa-clock"></i> <strong>Time:</strong> ${res.time}</div></div><div style="flex:1;min-width:150px;font-size:14px;display:flex;flex-direction:column;gap:6px;"><div><i class="fa-solid fa-users"></i> <strong>Guests:</strong> ${res.guests}</div><div><i class="fa-solid fa-chair"></i> <strong>Table:</strong> ${escHtml(res.table_number)}</div></div><div style="display:flex;gap:10px;flex-wrap:wrap;">${res.status==='pending'?`<button class="btn btn-primary" style="background:#2ecc71;border-color:#2ecc71;" onclick="updateReservation('${res.id}','confirmed')"><i class="fa-solid fa-check"></i> Accept</button>`:''} ${res.status!=='cancelled'?`<button class="btn btn-primary" style="background:transparent;border:1px solid #ff4757;color:#ff4757;" onclick="updateReservation('${res.id}','cancelled')"><i class="fa-solid fa-times"></i> Cancel</button>`:''}</div>`;
            c.appendChild(card);
        });
    }

    window.updateReservation = (id, status) => {
        fetch('../api/vendor_api.php?endpoint=update_reservation', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({reservation_id:id,status}) })
            .then(r=>r.json()).then(res => { if(res.success){showToast(`Reservation ${status==='confirmed'?'accepted':'cancelled'}.`); loadReservations();} else showToast(res.message,'error'); })
            .catch(()=>showToast('Failed to update.','error'));
    };

    // =========================================================
    // 7.5. RESERVATION HISTORY
    // =========================================================
    let vendorHistory = [];
    
    function loadHistory() {
        const tbody = document.getElementById('vHistoryTableBody');
        if (!tbody) return;
        tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;"><i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--orange)"></i></td></tr>';
        
        fetch('../api/vendor_api.php?endpoint=reservation_history')
            .then(r => r.json())
            .then(res => {
                if (res.success) {
                    vendorHistory = res.data || [];
                    renderHistory(vendorHistory);
                } else {
                    showToast(res.message, 'error');
                }
            })
            .catch(() => showToast('Failed to load history.', 'error'));
    }

    function renderHistory(data) {
        const tbody = document.getElementById('vHistoryTableBody');
        if (!tbody) return;
        tbody.innerHTML = '';
        
        if (data.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;padding:40px;color:var(--text-muted);">No past reservations found.</td></tr>';
            return;
        }

        data.forEach(r => {
            const statusColor = r.status === 'cancelled' ? '#e74c3c' : '#888';
            const statusText = r.status === 'cancelled' ? 'Cancelled' : 'Past';
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>#${r.id}</td>
                <td>
                    <strong>${escHtml(r.user_name)}</strong><br>
                    <span style="font-size: 12px; color: var(--text-muted);">${escHtml(r.user_phone || '—')}</span>
                </td>
                <td>${escHtml(r.restaurant_name)}</td>
                <td>
                    ${r.date}<br>
                    <span style="font-size: 12px; color: var(--text-muted);">${r.time.slice(0,5)}</span>
                </td>
                <td>${escHtml(r.table_number)}</td>
                <td>${r.guests}</td>
                <td>
                    ${r.manager_name ? 
                        `<span style="padding: 4px 8px; font-size: 11px; font-weight: 600; text-transform: uppercase; background: rgba(52, 152, 219, 0.1); color: #3492db; border-radius: 4px; border: 1px solid rgba(52, 152, 219, 0.3);">
                            <i class="fa-solid fa-user-tie" style="margin-right: 4px;"></i>${escHtml(r.manager_name)} (ID: ${r.manager_id})
                        </span>` : 
                        '<span style="color:var(--text-muted);font-size:12px;">—</span>'
                    }
                </td>
                <td>
                    <span style="color: ${statusColor}; font-size: 0.85rem; font-weight: 600; padding: 4px 8px; background: rgba(128,128,128,0.1); border-radius: 4px;">
                        ${statusText}
                    </span>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    window.filterVendorHistory = () => {
        const q = document.getElementById('searchHistory').value.toLowerCase();
        const filtered = vendorHistory.filter(r => 
            (r.restaurant_name && r.restaurant_name.toLowerCase().includes(q)) || 
            (r.user_name && r.user_name.toLowerCase().includes(q)) ||
            (r.user_phone && r.user_phone.toLowerCase().includes(q)) ||
            (r.manager_name && r.manager_name.toLowerCase().includes(q)) ||
            (r.id && r.id.toString().includes(q)) ||
            (r.date && r.date.toLowerCase().includes(q))
        );
        renderHistory(filtered);
    };

    // =========================================================
    // 8. EDIT / DELETE RESTAURANT (from card)
    // =========================================================
    window.editRestaurant = (id) => {
        const rest = vendorRestaurants.find(r => r.id === id);
        if (!rest) return;
        currentRestId = id;

        document.getElementById('restId').value        = rest.id;
        document.getElementById('restName').value      = rest.name;
        document.getElementById('restDesc').value      = rest.description || '';
        document.getElementById('restCuisine').value   = rest.cuisine || '';
        document.getElementById('restLocation').value  = rest.location || '';
        document.getElementById('restPrice').value     = rest.price_range || '$$';
        document.getElementById('restHalal').value     = rest.is_halal ?? '1';

        if (rest.opening_time) document.getElementById('restOpen').value  = rest.opening_time.substring(0,5);
        if (rest.closing_time) document.getElementById('restClose').value = rest.closing_time.substring(0,5);

        // Image preview
        const img = document.querySelector('#imagePreview img');
        const ph  = document.querySelector('#imagePreview .preview-placeholder');
        const lbl = document.getElementById('fileLabelText');
        if (rest.image_url) { img.src = rest.image_url; img.style.display='block'; if(ph) ph.style.display='none'; if(lbl) lbl.innerText='Change Image'; }
        else { if(img) img.style.display='none'; if(ph) ph.style.display='flex'; if(lbl) lbl.innerText='Choose Restaurant Image'; }

        document.getElementById('restModalTitle').innerText = 'Edit Restaurant';
        document.getElementById('restModal').classList.add('show');
    };

    // Open directly to floor plan for an existing restaurant
    window.editFloorPlan = (id) => {
        const rest = vendorRestaurants.find(r => r.id === id);
        if (!rest) return;
        
        // Switch to tables tab
        navLinks.forEach(l => l.classList.remove('active'));
        const link = document.querySelector('.admin-nav a[data-target="tables"]');
        if (link) link.classList.add('active');
        sections.forEach(sec => sec.classList.toggle('active', sec.id === 'tables'));
        
        vLoadFloorPlanSection(id);
    };

    window.deleteRestaurant = (id) => {
        const rest = vendorRestaurants.find(r => r.id === id);
        if (!rest || !confirm(`Delete "${rest.name}"? This will remove all its tables and cannot be undone.`)) return;
        fetch(`../api/vendor_api.php?endpoint=restaurants&id=${id}`, {method:'DELETE'})
            .then(r=>r.json()).then(res => { if(res.success){showToast('Restaurant deleted.'); loadRestaurants(); loadStats();} else showToast(res.message,'error'); })
            .catch(()=>showToast('Delete failed.','error'));
    };

    // =========================================================
    // 9. STEP 1 FORM SUBMIT → save restaurant → go to Step 2
    // =========================================================
    document.getElementById('restForm')?.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btn = this.querySelector('button[type="submit"]');
        btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        const id = document.getElementById('restId').value;
        const formData = new FormData();

        formData.append('name',          document.getElementById('restName').value.trim());
        formData.append('description',   document.getElementById('restDesc').value.trim());
        formData.append('cuisine',       document.getElementById('restCuisine').value.trim());
        formData.append('location',      document.getElementById('restLocation').value.trim());
        formData.append('price_range',   document.getElementById('restPrice').value.trim() || '$$');
        formData.append('is_halal',      document.getElementById('restHalal').value);

        const openVal  = document.getElementById('restOpen').value;
        const closeVal = document.getElementById('restClose').value;
        formData.append('opening_time',  openVal  ? openVal  + ':00' : '11:00:00');
        formData.append('closing_time',  closeVal ? closeVal + ':00' : '22:00:00');
        formData.append('opening_hours', `${openVal||'11:00'} - ${closeVal||'22:00'}`);
        formData.append('table_layout',  '2,4,4,6'); // default; overwritten in step 2

        const fileInput = document.getElementById('restImage');
        if (fileInput && fileInput.files.length > 0) formData.append('image', fileInput.files[0]);

        const url = id ? `../api/vendor_api.php?endpoint=restaurants&id=${id}` : `../api/vendor_api.php?endpoint=restaurants`;

        try {
            const res = await fetch(url, { method: 'POST', body: formData }).then(r => r.json());
            if (!res.success) { showToast(res.message || 'Failed to save.', 'error'); btn.disabled=false; btn.innerHTML='Save Restaurant'; return; }

            showToast('Restaurant details saved!');
            btn.disabled = false;
            btn.innerHTML = 'Save Restaurant';

            window.closeModal('restModal');
            loadRestaurants();
            loadStats();
        } catch (err) {
            console.error(err); showToast('Network error.', 'error');
            btn.disabled = false; btn.innerHTML = 'Save Restaurant';
        }
    });

    // =========================================================
    // 10. FLOOR PLAN EDITOR
    // =========================================================

    window.vLoadFloorPlanSection = async (preselectId = null) => {
        const select = document.getElementById('vTableRestSelect');
        if (!select) return;
        
        if (vendorRestaurants.length === 0) {
            const res = await fetch(`../api/vendor_api.php?endpoint=restaurants`).then(r=>r.json());
            if (res.success) vendorRestaurants = res.data || [];
        }

        select.innerHTML = '<option value="">Select Restaurant...</option>';
        vendorRestaurants.forEach(r => {
            const isOpen = (r.is_open === undefined || r.is_open == 1);
            const opt = document.createElement('option');
            opt.value = r.id;
            opt.textContent = `${r.name} ${isOpen ? '🟢 Open' : '🔴 Closed'}`;
            select.appendChild(opt);
        });

        if (preselectId) {
            select.value = preselectId;
            vLoadVendorFloorPlan(preselectId);
        } else {
            vLoadVendorFloorPlan(null);
        }
    };

    window.vLoadVendorFloorPlan = async (restId) => {
        vFloorTables  = [];
        vSelectedId   = null;
        vNextTempId   = -1;
        
        const room = document.getElementById('vendorFloorRoom');
        if (room) room.querySelectorAll('.floor-table').forEach(el => el.remove());
        renderVendorSidebar(null);
        
        // Remove any existing locked overlay
        document.getElementById('floorPlanLockedOverlay')?.remove();

        if (!restId) {
            currentRestId = null;
            setFloorPlanEditorEnabled(true);
            return;
        }

        currentRestId = restId;
        
        // Check if this restaurant is open — if so, disable editing
        const selectedRest = vendorRestaurants.find(r => r.id == restId);
        const isOpen = selectedRest ? (selectedRest.is_open === undefined || selectedRest.is_open == 1) : true;
        setFloorPlanEditorEnabled(!isOpen, selectedRest?.name);

        try {
            const res = await fetch(`../api/vendor_tables.php?restaurant_id=${restId}`).then(r => r.json());
            if (res.success) {
                vFloorTables = (res.data || []).map(t => ({...t, _dirty:false, _new:false, _delete:false}));
                renderVendorFloorPlan();
            } else {
                showToast(res.message || 'Could not load floor plan.', 'error');
            }
        } catch (err) { console.error(err); showToast('Could not load floor plan.', 'error'); }
    };

    // Enable or disable the entire floor plan editor
    function setFloorPlanEditorEnabled(enabled, restName = '') {
        const addRoundBtn  = document.querySelector('[onclick="vAddTable(\'round\', 4)"]');
        const addRectBtn   = document.querySelector('[onclick="vAddTable(\'rect\', 6)"]');
        const saveBtn      = document.getElementById('vendorSaveBtn');
        const canvas       = document.getElementById('vendorFloorCanvas');
        const sidebar      = document.getElementById('vendorFloorSidebar');

        [addRoundBtn, addRectBtn, saveBtn].forEach(btn => {
            if (!btn) return;
            btn.disabled = !enabled;
            btn.style.opacity = enabled ? '1' : '0.35';
            btn.style.cursor  = enabled ? 'pointer' : 'not-allowed';
        });

        // Remove old overlay if present
        document.getElementById('floorPlanLockedOverlay')?.remove();

        if (!enabled && canvas) {
            const overlay = document.createElement('div');
            overlay.id = 'floorPlanLockedOverlay';
            overlay.style.cssText = `
                position:absolute; inset:0; z-index:50;
                background: rgba(0,0,0,0.6);
                backdrop-filter: blur(3px);
                display:flex; flex-direction:column;
                align-items:center; justify-content:center;
                border-radius: 12px;
                pointer-events: all;
            `;
            overlay.innerHTML = `
                <div style="background:var(--dark-card,#1e1e1e);border:1px solid #ff4757;border-radius:16px;padding:36px 40px;text-align:center;max-width:360px;">
                    <div style="font-size:48px;margin-bottom:16px;">🔒</div>
                    <h3 style="color:#fff;margin-bottom:10px;font-size:18px;">Floor Plan Locked</h3>
                    <p style="color:#a0a0a0;font-size:14px;margin-bottom:20px;line-height:1.6;">
                        <strong style="color:#ff6b2b;">${escHtml(restName)}</strong> is currently <span style="color:#2ecc71;font-weight:bold;">Open</span>.<br>
                        You must mark the restaurant as <strong style="color:#e74c3c;">Closed</strong> before editing the floor plan.
                    </p>
                    <button onclick="toggleRestaurantOpen('${currentRestId}', 0)" style="
                        background:#e74c3c;color:#fff;border:none;border-radius:8px;
                        padding:12px 24px;font-size:14px;font-weight:600;cursor:pointer;
                        transition:all 0.2s;
                    ">
                        <i class='fa-solid fa-door-closed' style='margin-right:8px;'></i>Close Restaurant to Edit
                    </button>
                </div>
            `;
            // Make canvas relatively positioned so overlay works
            canvas.style.position = 'relative';
            canvas.appendChild(overlay);
            
            // Also lock sidebar
            if (sidebar) {
                sidebar.style.opacity = '0.35';
                sidebar.style.pointerEvents = 'none';
            }
        } else if (canvas) {
            if (sidebar) {
                sidebar.style.opacity = '1';
                sidebar.style.pointerEvents = '';
            }
        }
    }

    function renderVendorFloorPlan() {
        const room = document.getElementById('vendorFloorRoom');
        if (!room) return;
        room.querySelectorAll('.floor-table').forEach(el => el.remove());
        vFloorTables.filter(t => !t._delete).forEach(t => createVendorTableEl(t));
    }

    function createVendorTableEl(t) {
        const room = document.getElementById('vendorFloorRoom');
        if (!room) return;

        const el = document.createElement('div');
        el.className = `floor-table ${t.shape}`;
        el.dataset.id = t.id;

        const bw = t.shape === 'round' ? 80 : 110;
        const bh = t.shape === 'round' ? 80 : 70;
        const pad = 28;

        el.style.left   = t.x_pos + 'px';
        el.style.top    = t.y_pos + 'px';
        el.style.width  = (bw + pad * 2) + 'px';
        el.style.height = (bh + pad * 2) + 'px';

        const cap = parseInt(t.capacity) || 4;
        el.innerHTML = `${vendorSeatsHTML(t.shape, cap, bw, bh, pad)}<div class="table-body"><span class="table-label">T${t.table_number}</span><span class="table-cap">${cap} seats</span></div>`;

        if (t.id === vSelectedId) el.classList.add('selected');

        el.addEventListener('mousedown', (e) => { e.stopPropagation(); vStartDrag(e, t.id, el); });
        room.appendChild(el);
    }

    function vendorSeatsHTML(shape, cap, bw, bh, pad) {
        let html = '';
        const cx = pad + bw / 2, cy = pad + bh / 2;
        if (shape === 'round') {
            const r = bw / 2 + 14;
            for (let i = 0; i < cap; i++) {
                const a = (2 * Math.PI * i / cap) - Math.PI / 2;
                html += `<div class="seat" style="left:${(cx + r*Math.cos(a)-9).toFixed(1)}px;top:${(cy + r*Math.sin(a)-9).toFixed(1)}px;"></div>`;
            }
        } else {
            const top = Math.ceil(cap/2), bot = Math.floor(cap/2);
            for (let i=0;i<top;i++) html += `<div class="seat" style="left:${(pad+(bw/(top+1))*(i+1)-9).toFixed(1)}px;top:${(pad-16).toFixed(1)}px;"></div>`;
            for (let i=0;i<bot;i++) html += `<div class="seat" style="left:${(pad+(bw/(bot+1))*(i+1)-9).toFixed(1)}px;top:${(pad+bh-2).toFixed(1)}px;"></div>`;
        }
        return html;
    }

    function vStartDrag(e, id, el) {
        vSelectTable(id);
        const room = document.getElementById('vendorFloorRoom');
        const roomRect = room.getBoundingClientRect();
        const elRect   = el.getBoundingClientRect();
        const offX = e.clientX - elRect.left, offY = e.clientY - elRect.top;

        vDragState = { id, el, offX, offY };

        const onMove = (ev) => {
            if (!vDragState) return;
            const rx = ev.clientX - roomRect.left - vDragState.offX;
            const ry = ev.clientY - roomRect.top  - vDragState.offY;
            const sx = Math.round(rx/10)*10, sy = Math.round(ry/10)*10;
            const mx = room.offsetWidth  - vDragState.el.offsetWidth;
            const my = room.offsetHeight - vDragState.el.offsetHeight;
            const cx = Math.max(0, Math.min(sx, mx));
            const cy = Math.max(0, Math.min(sy, my));
            vDragState.el.style.left = cx + 'px';
            vDragState.el.style.top  = cy + 'px';
            const t = vFloorTables.find(t => t.id === vDragState.id);
            if (t) { t.x_pos = cx; t.y_pos = cy; t._dirty = true; }
        };
        const onUp = () => {
            vDragState = null;
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            // Update position fields in sidebar if open
            const t = vFloorTables.find(t => t.id === vSelectedId);
            if (t) { const xEl = document.getElementById('vsp-x'); const yEl = document.getElementById('vsp-y'); if(xEl) xEl.value = t.x_pos; if(yEl) yEl.value = t.y_pos; }
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
    }

    function vSelectTable(id) {
        vSelectedId = id;
        document.querySelectorAll('#vendorFloorRoom .floor-table').forEach(el => el.classList.remove('selected'));
        const el = document.querySelector(`#vendorFloorRoom .floor-table[data-id="${id}"]`);
        if (el) el.classList.add('selected');
        renderVendorSidebar(vFloorTables.find(t => t.id === id));
    }

    function renderVendorSidebar(t) {
        const sb = document.getElementById('vendorFloorSidebar');
        if (!sb) return;
        if (!t) {
            sb.innerHTML = `<div class="floor-sidebar-header">Properties</div><div style="flex:1;display:flex;align-items:center;justify-content:center;"><p style="color:var(--text-muted);font-size:12px;text-align:center;padding:16px;">Click a table to select and edit it</p></div>`;
            return;
        }
        sb.innerHTML = `
            <div class="floor-sidebar-header">Table ${escHtml(String(t.table_number))}</div>
            <div class="floor-sidebar-body">
                <div class="form-group">
                    <label style="font-size:11px;">Table Label</label>
                    <input type="text" class="form-control" id="vsp-num" value="${escHtml(String(t.table_number))}" style="font-size:12px;" oninput="vUpdateTable('table_number',this.value)">
                </div>
                <div class="form-group">
                    <label style="font-size:11px;">Capacity (seats)</label>
                    <input type="number" class="form-control" id="vsp-cap" value="${t.capacity}" min="1" max="20" style="font-size:12px;" oninput="vUpdateTable('capacity',this.value)">
                </div>
                <div class="form-group">
                    <label style="font-size:11px;">Shape</label>
                    <select class="form-control" id="vsp-shape" style="font-size:12px;" onchange="vUpdateTable('shape',this.value)">
                        <option value="round" ${t.shape==='round'?'selected':''}>Round</option>
                        <option value="rect"  ${t.shape==='rect' ?'selected':''}>Rectangular</option>
                    </select>
                </div>
                <div class="form-group">
                    <label style="font-size:11px;">Position (X / Y)</label>
                    <div style="display:flex;gap:6px;">
                        <input type="number" class="form-control" id="vsp-x" value="${t.x_pos}" placeholder="X" style="flex:1;font-size:12px;" oninput="vUpdatePos('x_pos',this.value)">
                        <input type="number" class="form-control" id="vsp-y" value="${t.y_pos}" placeholder="Y" style="flex:1;font-size:12px;" oninput="vUpdatePos('y_pos',this.value)">
                    </div>
                </div>
                <button class="sidebar-delete-btn" style="font-size:12px;" onclick="vDeleteTable(${t.id})"><i class="fa-solid fa-trash"></i> Delete Table</button>
            </div>`;
    }

    window.vUpdateTable = (key, value) => {
        const t = vFloorTables.find(t => t.id === vSelectedId); if (!t) return;
        t[key] = value; t._dirty = true;
        const old = document.querySelector(`#vendorFloorRoom .floor-table[data-id="${t.id}"]`);
        if (old) old.remove();
        createVendorTableEl(t);
        document.querySelector(`#vendorFloorRoom .floor-table[data-id="${t.id}"]`)?.classList.add('selected');
        const hdr = document.querySelector('#vendorFloorSidebar .floor-sidebar-header');
        if (hdr) hdr.textContent = `Table ${t.table_number}`;
    };

    window.vUpdatePos = (key, value) => {
        const t = vFloorTables.find(t => t.id === vSelectedId); if (!t) return;
        t[key] = parseInt(value)||0; t._dirty = true;
        const el = document.querySelector(`#vendorFloorRoom .floor-table[data-id="${t.id}"]`);
        if (el) { if(key==='x_pos') el.style.left = t.x_pos+'px'; if(key==='y_pos') el.style.top = t.y_pos+'px'; }
    };

    window.vDeleteTable = (id) => {
        if (!confirm('Delete this table?')) return;
        const t = vFloorTables.find(t => t.id === id); if (!t) return;
        if (t._new) { vFloorTables = vFloorTables.filter(x => x.id !== id); }
        else { t._delete = true; }
        document.querySelector(`#vendorFloorRoom .floor-table[data-id="${id}"]`)?.remove();
        vSelectedId = null; renderVendorSidebar(null);
        showToast('Table removed (save to confirm).', 'success');
    };

    window.vAddTable = (shape, capacity) => {
        if (!currentRestId) { showToast('Please save restaurant details first.', 'error'); return; }
        const count = vFloorTables.filter(t => !t._delete).length + 1;
        const newT = {
            id: vNextTempId--,
            restaurant_id: currentRestId,
            table_number: String(count),
            capacity, shape,
            x_pos: 60  + Math.floor(Math.random() * 400),
            y_pos: 60  + Math.floor(Math.random() * 300),
            _new: true, _dirty: true, _delete: false
        };
        vFloorTables.push(newT);
        createVendorTableEl(newT);
        vSelectTable(newT.id);
    };

    // ── Save all: save new/dirty tables, delete flagged ones ──
    window.vendorSaveAll = async () => {
        if (!currentRestId) { showToast('No restaurant to save.', 'error'); return; }
        const btn = document.getElementById('vendorSaveBtn');
        btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

        try {
            // 1. Delete flagged
            for (const t of vFloorTables.filter(x => x._delete && !x._new)) {
                await fetch(`../api/vendor_tables.php?id=${t.id}`, {method:'DELETE'});
            }
            vFloorTables = vFloorTables.filter(x => !x._delete);

            // 2. Create new
            for (const t of vFloorTables.filter(x => x._new && x._dirty)) {
                const res = await fetch(`../api/vendor_tables.php`, {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ restaurant_id: currentRestId, table_number: t.table_number, capacity: t.capacity, shape: t.shape, x_pos: t.x_pos, y_pos: t.y_pos })
                }).then(r => r.json());
                if (res.success && res.id) {
                    const el = document.querySelector(`#vendorFloorRoom .floor-table[data-id="${t.id}"]`);
                    if (el) el.dataset.id = res.id;
                    t.id = res.id;
                }
                t._new = false; t._dirty = false;
            }

            // 3. Update dirty existing
            for (const t of vFloorTables.filter(x => x._dirty && !x._new)) {
                await fetch(`../api/vendor_tables.php?id=${t.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({ table_number: t.table_number, capacity: t.capacity, shape: t.shape, x_pos: t.x_pos, y_pos: t.y_pos })
                });
                t._dirty = false;
            }

            showToast('Floor plan saved successfully!');
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Layout';
            }, 1200);
        } catch (err) {
            console.error(err);
            showToast('Save failed. Please try again.', 'error');
            btn.disabled = false;
            btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Layout';
        }
    };

    // =========================================================
    // 11. INITIAL LOAD
    // =========================================================
    loadStats();
});
