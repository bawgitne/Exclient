// ====== cấu hình ======
const TARGET_CLASSES = [
    "x9f619", "x1ja2u2z", "x78zum5", "x2lah0s", "x1n2onr6", "x1qughib",
    "x1qjc9v5", "xozqiw3", "x1q0g3np", "xjkvuk6", "x1iorvi4", "x11lt19s",
    "xe9ewy2", "x4cne27", "xifccgj"
];

// đánh dấu để không chèn trùng
const MARK_ATTR = "data-fb-injected-share";

const INJECT_HTML = `
  <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k x14vy60q xyiysdx x10b6aqq x1yrsyyn" ${MARK_ATTR}="1">
    <div aria-label="Là nút đăng lại đó hiểu chưa bà"
         class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xdl72j9 x2lah0s x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1fmog5m xu25z0z x140muxe xo1y3bh x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz"
         role="button" tabindex="0">
      <div class="x9f619 x1ja2u2z x78zum5 x1n2onr6 x1r8uery x1iyjqo2 xs83m0k xeuugli xl56j7k x6s0dn4 xozqiw3 x1q0g3np xpdmqnj x1g0dm76 xexx8yu x1lxpwgx x165d6jo x4cne27 xifccgj xn3w4p2 xuxw1ft">
        <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x11lfxj5 x135b78x x10b6aqq x1yrsyyn">
          <i data-visualcompletion="css-img" class="x1b0d499 x1d69dk1"
             style="background-image:url('https://static.xx.fbcdn.net/rsrc.php/v4/y5/r/lwE5nTQ9s_K.png?_nc_eui2=AeGgD6HRr7P8OqfaFOL9qhoBDBtomacO-zkMG2iZpw77OY0MIgZYVG2UyzZSokD6kxhGT-blbf1VG1vc4BLiJrN1');
                    background-position:0 -715px;background-size:auto;width:20px;height:20px;background-repeat:no-repeat;display:inline-block"></i>
        </div>
        <div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli x11lfxj5 x135b78x x10b6aqq x1yrsyyn">
          <span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1f6kntn xvq8zen x1s688f xi81zsa" dir="auto">
            <span data-ad-rendering-role="share_button">Đăng lại</span>
          </span>
        </div>
      </div>
      <div class="x1ey2m1c xtijo5x x1o0tod xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh"
           role="none" data-visualcompletion="ignore" style="border-radius: 4px; inset: 0px; transition: all 0.2s ease-in-out;"></div>
    </div>
  </div>
  `;

// ====== helpers ======
function hasAllClasses(el, classes) {
    if (!el || !el.classList || !Array.isArray(classes)) {
        return false;
    }
    return classes.every(c => el.classList.contains(c));
}

function createFragment(html) {
    try {
        const t = document.createElement('template');
        t.innerHTML = html.trim();
        return t.content.firstElementChild;
    } catch (e) {
        console.warn('[EXT] createFragment failed:', e);
        return null;
    }
}

function injectInto(el) {
    if (!el || el.querySelector(`[${MARK_ATTR}]`)) return;

    try {
        const node = createFragment(INJECT_HTML);
        if (!node) return;

        // nếu muốn nhét đầu/cuối, chỉnh lại vị trí insert ở đây
        el.insertAdjacentElement('beforeend', node);

        // ví dụ: gán click handler riêng của bạn
        const btn = node.querySelector('[role="button"]');
        if (btn) {
            btn.addEventListener('click', async (e) => {
                e.stopPropagation();
                console.log('[EXT] share clicked!');

                // Post ID detection code (giữ lại để debug)
                (() => {
                    const LOG_TAG = "[POST-ID]";
                    const safeJSON = s => { try { return JSON.parse(s); } catch { return null; } };

                    function getIdFromUrl(href) {
                        if (!href) return null;
                        try { href = new URL(href, location.href).toString(); } catch { }
                        const u = new URL(href, location.href);
                        if (u.pathname.includes("/permalink.php")) {
                            const fbid = u.searchParams.get("story_fbid") || u.searchParams.get("fbid");
                            if (fbid && /^\d+$/.test(fbid)) return fbid;
                        }
                        const m = href.match(/\/posts\/(\d+)/);
                        if (m) return m[1];
                        const mp = u.searchParams.get("multi_permalinks");
                        if (mp && /^\d+$/.test(mp)) return mp;
                        const fbid2 = u.searchParams.get("story_fbid") || u.searchParams.get("fbid");
                        if (fbid2 && /^\d+$/.test(fbid2)) return fbid2;
                        return null;
                    }

                    function getIdFromDataFt(el) {
                        if (!el) return null;
                        const raw = el.getAttribute?.("data-ft");
                        if (raw) {
                            const obj = safeJSON(raw);
                            if (obj?.top_level_post_id && /^\d+$/.test(obj.top_level_post_id)) return obj.top_level_post_id;
                            if (obj?.mf_story_key && /^\d+$/.test(obj.mf_story_key)) return obj.mf_story_key;
                        }
                        for (const attr of ["data-testid", "data-store", "data-gt"]) {
                            const v = el.getAttribute?.(attr);
                            if (!v) continue;
                            const obj = safeJSON(v);
                            if (obj?.top_level_post_id && /^\d+$/.test(obj.top_level_post_id)) return obj.top_level_post_id;
                            if (obj?.mf_story_key && /^\d+$/.test(obj.mf_story_key)) return obj.mf_story_key;
                        }
                        return null;
                    }

                    function findPostIdInNode(root) {
                        if (!root) return null;

                        let id = getIdFromDataFt(root);
                        if (id) return id;

                        const links = root.querySelectorAll?.(
                            'a[href*="/permalink.php"], a[href*="/posts/"], a[href*="multi_permalinks="], a[href*="story_fbid="], a[href*="fbid="]'
                        ) || [];
                        for (const a of links) {
                            const id2 = getIdFromUrl(a.getAttribute("href"));
                            if (id2) return id2;
                        }

                        const ftNodes = root.querySelectorAll?.("[data-ft]") || [];
                        for (const el of ftNodes) {
                            const id3 = getIdFromDataFt(el);
                            if (id3) return id3;
                        }

                        const articles = root.querySelectorAll?.('[role="article"]') || [];
                        for (const art of articles) {
                            const id4 = getIdFromDataFt(art) || findPostIdInNode(art);
                            if (id4) return id4;
                        }
                        return null;
                    }

                    function logNow(id, tag = "repost-button") {
                        const ts = new Date().toISOString();
                        if (!id) console.log(`${LOG_TAG} ${tag} @ ${ts} → Không tìm thấy Post ID`);
                        else console.log(`${LOG_TAG} ${tag} @ ${ts} → Post ID:`, id);
                    }

                    // Tìm post ID từ button được click
                    const container = btn.closest?.('[role="article"], [data-ft], [data-testid*="post"]') || document;

                    // Thử ngay
                    let id = findPostIdInNode(container);
                    if (id) return logNow(id, "repost-button");

                    // Retry 0ms (cho trường hợp FB gắn attr/href trễ)
                    setTimeout(() => {
                        const id2 = findPostIdInNode(container) || findPostIdInNode(document);
                        logNow(id2, "repost-button(retry)");
                    }, 0);
                })();

                // Inject HTML modal khi click và gắn handler riêng
                injectModal();
                attachModalHandlers(btn);
            });

            // Thêm hover effect bằng JavaScript
            const hoverDiv = btn.querySelector('.x1ey2m1c.xtijo5x.x1o0tod.xg01cxk.x47corl.x10l6tqk.x13vifvy.x1ebt8du.x19991ni.x1dhq9h.x1fmog5m.xu25z0z.x140muxe.xo1y3bh');
            if (hoverDiv) {
                // Mouse enter - thêm class hover
                btn.addEventListener('mouseenter', () => {
                    hoverDiv.className = 'x1ey2m1c xtijo5x x1o0tod x47corl x10l6tqk x13vifvy x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh x1hc1fzr x1mq3mr6 x1wpzbip';
                });

                // Mouse leave - trả về class ban đầu
                btn.addEventListener('mouseleave', () => {
                    hoverDiv.className = 'x1ey2m1c xtijo5x x1o0tod xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh';
                });
                btn.addEventListener('click', () => {
                    hoverDiv.className = 'x1ey2m1c xtijo5x x1o0tod x47corl x10l6tqk x13vifvy x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh x1hc1fzr x1mq3mr6 x1iutvsz';
                });
            }
        }
    } catch (e) {
        console.warn('[EXT] inject failed:', e);
    }
}

// ====== quét lần đầu ======
function scanAndInject(root = document) {
    try {
        const candidates = root.querySelectorAll('div');
        for (const el of candidates) {
            if (hasAllClasses(el, TARGET_CLASSES)) {
                injectInto(el);
                //console.log('[EXT] injected into', el);
            }
        }
    } catch (e) {
        console.warn('[EXT] scanAndInject failed:', e);
    }
}

// ====== theo dõi DOM động (Facebook là SPA) ======
let obs = null;

function createObserver() {
    try {
        obs = new MutationObserver(muts => {
            for (const m of muts) {
                // node mới
                m.addedNodes.forEach(n => {
                    if (n.nodeType !== 1) return;
                    if (n.matches && hasAllClasses(n, TARGET_CLASSES)) {
                        injectInto(n);
                    }
                    // tìm sâu bên trong
                    scanAndInject(n);
                });
            }
        });
    } catch (e) {
        console.warn('[EXT] createObserver failed:', e);
    }
}

function start() {
    try {
        scanAndInject(document);
        createObserver();
        if (obs) {
            obs.observe(document.documentElement, { childList: true, subtree: true });
        }
    } catch (e) {
        console.warn('[EXT] start failed:', e);
    }
}



// ====== inject modal function ======
function injectModal() {
    // === HTML lấy từ Facebook ===
    const htmlNew = `
<div><div><div class="__fb-dark-mode x1n2onr6 xzkaem6"><div class="x9f619 x1n2onr6 x1ja2u2z"><div class="x78zum5 xdt5ytf xg6iff7 xippug5 x1n2onr6"><div class="x1ey2m1c xtijo5x x1o0tod xixxii4 x13vifvy x1h0vfkc"></div><div class="x1uvtmcs x4k7w5x x1h91t0o x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1n2onr6 x1qrby5j x1jfb8zj" tabindex="-1"><div class="__fb-dark-mode x1qjc9v5 x9f619 x78zum5 xdt5ytf x1iyjqo2 xl56j7k xshlqvt"><div class="x9f619 x78zum5 xl56j7k x2lwn1j xeuugli x47corl x1qjc9v5 x1bwycvy x1x97wu9 xbr3nou x135b78x x11lfxj5 xqit15g x1bi8yb4"><div aria-labelledby="_r_m9_" role="dialog" class="x1n2onr6 x1ja2u2z x1afcbsf xdt5ytf x1a2a7pz x71s49j x1qjc9v5 xazwl86 x1hl0hii x1aq6byr x2k6n7x x78zum5 x1plvlek xryxfnj xcatxm7 x1n7qst7 xh8yej3"><div class="x1qjc9v5 x78zum5 xdt5ytf x1n2onr6 x1al4vs7 x1jx94hy xazwl86 x1hl0hii x1aq6byr x2k6n7x x104qc98 x1gj8qfm x1iyjqo2 x6ikm8r x10wlt62 x1likypf xzit4ce x1e9k66k x12l8kdc"><div aria-hidden="false" class="x1fmog5m xu25z0z x140muxe xo1y3bh x78zum5 xdt5ytf x1iyjqo2 x1al4vs7"><div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x78zum5 xdt5ytf x1iyjqo2 x1yr2tfi x1jxyteu x1n2onr6"><div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl xh8yej3"><div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 x2lah0s x1qughib x879a55 x1n2onr6"><div class="html-div xdj266r xat24cr xexx8yu xyri2b x18d9i69 x1c1uobl xyqm7xq x1ys307a xc9qbxq x14qfxbe"></div><div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 xeuugli"><h2 dir="auto" class="html-h2 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1vvkbs x1heor9g x1qlqyl8 x1pd3egz x1a2a7pz x193iq5w xeuugli"><span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xtoi2st x3x7a5m x1603h9y x1u7k74 x1xlr1w8 xzsf02u x2b8uid" dir="auto" id="_r_m9_">Chia sẻ</span></h2></div><div class="html-div xdj266r xat24cr xexx8yu xyri2b x18d9i69 x1c1uobl xyqm7xq x1ys307a"><div aria-label="Đóng" class="x1i10hfl xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x1ypdohk xdl72j9 x2lah0s x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1q0g3np x87ps6o x1lku1pv x1a2a7pz x6s0dn4 x1iwo8zk x1033uif x179ill4 x1b60jn0 x972fbf x10w94by x1qhh985 x14e42zd x9f619 x78zum5 xl56j7k xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 xc9qbxq x14qfxbe x1qhmfi1" role="button" tabindex="0"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true" class="x14rh7hd x1lliihq x1tzjh5l x1k90msu x2h7rmj x1qfuztq" style="--x-color: var(--primary-icon);"><path d="M19.884 5.884a1.25 1.25 0 0 0-1.768-1.768L12 10.232 5.884 4.116a1.25 1.25 0 1 0-1.768 1.768L10.232 12l-6.116 6.116a1.25 1.25 0 0 0 1.768 1.768L12 13.768l6.116 6.116a1.25 1.25 0 0 0 1.768-1.768L13.768 12l6.116-6.116z"></path></svg><div class="x1ey2m1c xtijo5x x1o0tod xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1iwo8zk x1033uif x179ill4 x1b60jn0" role="none" data-visualcompletion="ignore"></div></div></div></div><hr class="html-hr xexx8yu xyri2b x18d9i69 x1c1uobl x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd xdj266r x14z9mp xat24cr x1lziwak x14nfmen x9f619 xjm9jq1"></div><div class="xb57i2i x1q594ok x5lxg6s x78zum5 xdt5ytf x6ikm8r x1ja2u2z x1pq812k x1rohswg xfk6m8 x1yqm8si xjx87ck xx8ngbg xwo3gff x1n2onr6 x1oyok0e x1odjw0f x1iyjqo2 xy5w88m"><div class="x78zum5 xdt5ytf x2lah0s x10wjd1d xtijo5x x1o0tod x47corl x7wzq59 x1vjfegm x7itwyc x1nhvcw1 xepu288"><div class="x2lah0s xlup9mm x7wzq59 x7r5tp8 x1s928wv x1a5uphr x1j6awrg x1s71c9q x4eaejv x13vifvy"></div></div><div class="x78zum5 xdt5ytf x1iyjqo2 x1n2onr6 xaci4zi x129vozr"><div class="html-div xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x78zum5 xdt5ytf x1iyjqo2 x7ywyr2"><div class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"><form method="POST"><div class="x1n2onr6 x1ja2u2z x9f619 x78zum5 xdt5ytf x2lah0s x193iq5w"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x1iyjqo2 x2lwn1j"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"><div class="x6s0dn4 x78zum5 x1ys307a xyqm7xq xyamay9 xyri2b x1l90r2v x1c1uobl"><div class="x1ox92ov"><div class="x1rg5ohu x1n2onr6 x3ajldb x1ja2u2z"><svg aria-hidden="true" class="x3ajldb" data-visualcompletion="ignore-dynamic" role="none" style="height: 40px; width: 40px;"><mask id="_r_mb_"><circle cx="20" cy="20" fill="white" r="20"></circle></mask><g mask="url(#_r_mb_)"><image x="0" y="0" height="100%" preserveAspectRatio="xMidYMid slice" width="100%" xlink:href="https://scontent.fsgn5-13.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=cp0_dst-png_s40x40&amp;_nc_cat=1&amp;ccb=1-7&amp;_nc_sid=b224c7&amp;_nc_eui2=AeF-axlTO4NvxxMtcQLNGlX8Wt9TLzuBU1Ba31MvO4FTUMdvP-OJd1ZafLYXCeGwCSp2M13CECJmemIBvF-L9YXg&amp;_nc_ohc=NhG5hMcBqeIQ7kNvwFD6bpt&amp;_nc_oc=AdkotvHYXRgkP-6osbjRd9I9dQhvoyZgL1zdAApm619cLd1yT6DOjPD6ttf42X3xhIY&amp;_nc_zt=24&amp;_nc_ht=scontent.fsgn5-13.fna&amp;oh=00_AfVpBMmeNfzlTmGlIwGr-zBV12MPR0-qlSSTJfz17oLAQw&amp;oe=68C36F3A" style="height: 40px; width: 40px;"></image><circle class="xbh8q5q x1pwv2dq xvlca1e" cx="20" cy="20" r="20"></circle></g></svg></div></div><div class="x78zum5 xdt5ytf xh8yej3"><div class="x78zum5 x1q0g3np"><span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1f6kntn xvq8zen x1s688f xzsf02u" dir="auto">Ngô Bằng</span></div><div class="x1aawmmo"><div class="x6s0dn4 x78zum5"><div class="x6s0dn4 x3nfvp2 xl56j7k xf159sx"><div aria-label="Chia sẻ lên Bảng feed (Chỉ đọc)" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x9f619 xt0psk2 x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1fmog5m xu25z0z x140muxe xo1y3bh x1n2onr6 x87ps6o x1lku1pv xt0e3qv x1a2a7pz" role="button" tabindex="-1"><span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x676frb x1pg5gke x1sibtaa x1s688f xzsf02u" dir="auto"><div class="x1qhmfi1 x1i5p2am x1whfx0g xr2y4jy x1ihp6rs x1iorvi4 xjkvuk6 xmzvs34 xf159sx x1a2a7pz"><span class="x2fvf9 xeaf4i8">Mục đăng lại</span></div></span></div></div><div><div class="x6s0dn4 x3nfvp2 xl56j7k"><div aria-label="Chỉnh sửa quyền riêng tư. Đang chia sẻ với Công khai. " class="x1i10hfl x1qjc9v5 xjbqb8w xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x972fbf x10w94by x1qhh985 x14e42zd x9f619 x1ypdohk xdl72j9 x2lah0s x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak x2lwn1j xeuugli xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 x16tdsg8 x1hl2dhg xggy1nq x1ja2u2z x1t137rt x1fmog5m xu25z0z x140muxe xo1y3bh x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz" role="button" tabindex="0"><span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x x4zkp8e x676frb x1pg5gke x1sibtaa x1s688f xzsf02u" dir="auto"><div class="x1n2onr6"><div class="x1qhmfi1 x1i5p2am x1whfx0g xr2y4jy x1ihp6rs x1iorvi4 xjkvuk6 xmzvs34 xf159sx x1a2a7pz"><div class="x6s0dn4 x78zum5 xl56j7k"><div aria-hidden="true" class="x6s0dn4 x3nfvp2 xl56j7k x2fvf9"><img class="x1b0d499 xep6ejk" alt="Công khai" height="12" width="12" src="https://static.xx.fbcdn.net/rsrc.php/v4/y5/r/qop9rFQ_Ys1.png?_nc_eui2=AeH_5uhUPWGJxvnjlpobPCOXRdYIPs78prZF1gg-zvymtqQspcBjCDplnov-zqobwWlFy_ADtzHnGPEnCjR5dL7f"></div><span class="html-span xdj266r xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x2fvf9 xeaf4i8">Công khai</span><i data-visualcompletion="css-img" class="x1b0d499 xep6ejk" style="background-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/v4/y5/r/lwE5nTQ9s_K.png?_nc_eui2=AeGgD6HRr7P8OqfaFOL9qhoBDBtomacO-zkMG2iZpw77OY0MIgZYVG2UyzZSokD6kxhGT-blbf1VG1vc4BLiJrN1&quot;); background-position: -17px -996px; background-size: auto; width: 12px; height: 12px; background-repeat: no-repeat; display: inline-block;"></i></div></div></div></span></div></div></div></div></div></div></div></div><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"><div class="x9f619 x1ja2u2z x78zum5 x2lah0s x1n2onr6 x1qughib x6s0dn4 xozqiw3 x1q0g3np xv54qhq xf7dkkf xexx8yu"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k"><div><div class="xvq8zen xd9ej83"><div class="xb57i2i x1q594ok x5lxg6s x6ikm8r x1ja2u2z x1pq812k x1rohswg xfk6m8 x1yqm8si xjx87ck xx8ngbg xwo3gff x1n2onr6 x1oyok0e x1odjw0f x1e4zzel x78zum5 xdt5ytf x1iyjqo2 x1jquxbb x1ba4aug xp48ta0"><div class="x78zum5 xdt5ytf x1iyjqo2 x1n2onr6"><div class="xzsf02u x1a2a7pz x1n2onr6 x14wi4xw x9f619 x1lliihq x5yr21d xh8yej3 notranslate" contenteditable="true" role="textbox" spellcheck="true" tabindex="0" aria-placeholder="Hãy nói gì đó về nội dung này (không bắt buộc)" data-lexical-editor="true" style="user-select: text; white-space: pre-wrap; word-break: break-word; font-size: 15px;"><p class="xdj266r x14z9mp x1lziwak xzsf02u x1a2a7pz" style="text-align: left;"><br></p></div><div aria-hidden="true"><div class="xi81zsa x6ikm8r x10wlt62 x47corl x10l6tqk xlyipyv xs7f9wi x87ps6o x1vjfegm" style="font-size: 15px;">Hãy nói gì đó về nội dung này (không bắt buộc)</div></div></div><div class="x14nfmen x1s85apg x5yr21d xtijo5x xg01cxk x10l6tqk x13vifvy x1wsgiic x19991ni xwji4o3 x1kky2od x1sd63oq" data-visualcompletion="ignore" data-thumb="1" style="display: none; height: 40px; right: 0px;"></div><div class="x9f619 x1s85apg xtijo5x xg01cxk xexx8yu x18d9i69 x135b78x x11lfxj5 x47corl x10l6tqk x13vifvy x1n4smgl x1d8287x x19991ni xwji4o3 x1kky2od" data-visualcompletion="ignore" data-thumb="1" style="display: block; height: 0px; right: 0px;"><div class="x1hwfnsy xjwep3j x1t39747 x1wcsgtt x1pczhz8 x5yr21d xh8yej3"></div></div></div></div><div class="x9f619 x1ja2u2z x78zum5 x2lah0s x1qughib x1qjc9v5 xozqiw3 x1q0g3np xsugpx9 x1euzuty x10l6tqk"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli"><div><div class="x1ks1olk"><div><span class="html-span xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1hl2dhg x16tdsg8 x1vvkbs x4k7w5x x1h91t0o x1h9r5lt x1jfb8zj xv2umb2 x1beo9mf xaigb6o x12ejxvf x3igimt xarpa2k xedcshv x1lytzrv x1t2pt76 x7ja8zs x1qrby5j"><div aria-label="Biểu tượng cảm xúc" class="x1i10hfl x1qjc9v5 xjqpnuy xc5r6h4 xqeqjp1 x1phubyo x1ypdohk xdl72j9 x2lah0s x3ct3a4 x2lwn1j xeuugli x1hl2dhg xggy1nq x1t137rt x1fmog5m xu25z0z x140muxe xo1y3bh x3nfvp2 x1q0g3np x87ps6o x1lku1pv x1a2a7pz xjyslct xjbqb8w x13fuv20 x18b5jzi x1q0q8m5 x1t7ytsu x972fbf x10w94by x1qhh985 x14e42zd x9f619 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x1n2onr6 x16tdsg8 x1ja2u2z" role="button" tabindex="0"><div><div><div class="xc9qbxq x1n2onr6 x14qfxbe x1c9tyrk xeusxvb x1pahc9y x1ertn4p"><div class="x4k7w5x x1h91t0o x1fmog5m xu25z0z x140muxe xo1y3bh x1jfb8zj x1beo9mf x3igimt xarpa2k x1n2onr6 x1qrby5j"><div class="x6s0dn4 x78zum5 xl56j7k x1n2onr6 x5yr21d xh8yej3"><i data-visualcompletion="css-img" class="x1b0d499 xl1xv1r" aria-label="Biểu tượng cảm xúc" role="img" style="height: 24px; width: 24px; background-image: url(&quot;https://static.xx.fbcdn.net/rsrc.php/v4/ys/r/g6y3DYFXGRL.png?_nc_eui2=AeGL_EUDB2IBQkjTov2AZ8LCA_q49qAPJlkD-rj2oA8mWenH1EPT_NNuHoDuGEss84OsNbzch3D61QpLd361SmyW&quot;); background-position: -25px -73px; background-size: auto; background-repeat: no-repeat; display: inline-block;"></i></div></div></div></div><div><div></div></div></div></div></span></div></div></div></div></div></div></div></div></div></div><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w"><div class="x9f619 x1ja2u2z x78zum5 x2lah0s x1n2onr6 x1qughib x6s0dn4 xozqiw3 x1q0g3np xv54qhq xf7dkkf x1l90r2v xyamay9"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x193iq5w xeuugli x1r8uery x1iyjqo2 xs83m0k"><div class="x6s0dn4 x78zum5 x15zctf7 x1qughib xh8yej3"><div class="x9f619 x1n2onr6 x1ja2u2z x78zum5 xdt5ytf x2lah0s x193iq5w xeuugli"><div aria-label="Chia sẻ ngay" class="x1i10hfl xjbqb8w x1ejq31n x18oe1m7 x1sy0etr xstzfhl x972fbf x10w94by x1qhh985 x14e42zd x1ypdohk x3ct3a4 xdj266r x14z9mp xat24cr x1lziwak xexx8yu xyri2b x18d9i69 x1c1uobl x16tdsg8 x1hl2dhg xggy1nq x1fmog5m xu25z0z x140muxe xo1y3bh x87ps6o x1lku1pv x1a2a7pz x9f619 x3nfvp2 xdt5ytf xl56j7k x1n2onr6 xh8yej3" role="button" tabindex="0"><div role="none" class="x1ja2u2z x78zum5 x2lah0s x1n2onr6 xl56j7k x6s0dn4 xozqiw3 x1q0g3np x14ldlfn x1b1wa69 xws8118 x5fzff1 x972fbf x10w94by x1qhh985 x14e42zd x9f619 xp48ta0 xtssl2i xtvsq51 x1r1pt67"><div class="html-div xdj266r xat24cr xexx8yu xyri2b x18d9i69 x1c1uobl x6s0dn4 x78zum5 xl56j7k x14ayic xwyz465 x1e0frkt"><div role="none" class="x9f619 x1n2onr6 x1ja2u2z x193iq5w xeuugli x6s0dn4 x78zum5 x2lah0s xsqbvy7 xb9jzoj"><span class="x193iq5w xeuugli x13faqbe x1vvkbs x1xmvt09 x1lliihq x1s928wv xhkezso x1gmr53x x1cpjm7i x1fgarty x1943h6x xudqn12 x3x7a5m x1f6kntn xvq8zen x1s688f xtk6v10" dir="auto"><span class="x1lliihq x6ikm8r x10wlt62 x1n2onr6 xlyipyv xuxw1ft">Chia sẻ ngay</span></span></div></div><div class="x1ey2m1c xtijo5x x1o0tod xg01cxk x47corl x10l6tqk x13vifvy x1ebt8du x19991ni x1dhq9h x1fmog5m xu25z0z x140muxe xo1y3bh" role="none" data-visualcompletion="ignore"></div></div></div></div><div class="x78zum5 xdt5ytf"></div></div></div></div></div></div></div><input type="submit" style="display: none;"></form></div></div></div></div></div><div class="x78zum5 xdt5ytf x2lah0s x10wjd1d xtijo5x x1o0tod x47corl x7wzq59 x1vjfegm x1l3hj4d x3m8hty x13a6bvl x1yztbdb"><div class="x2lah0s xlup9mm x7wzq59 x7r5tp8 x1s928wv x1a5uphr x1j6awrg x1s71c9q x4eaejv x1ey2m1c xtjevij"></div></div><div class="x14nfmen x1s85apg x5yr21d xtijo5x xg01cxk x10l6tqk x13vifvy x1wsgiic x19991ni xwji4o3 x1kky2od x1sd63oq" data-visualcompletion="ignore" data-thumb="1" style="display: none; height: 180px; right: 0px;"></div><div class="x9f619 x1s85apg xtijo5x xg01cxk xexx8yu x18d9i69 x135b78x x11lfxj5 x47corl x10l6tqk x13vifvy x1n4smgl x1d8287x x19991ni xwji4o3 x1kky2od" data-visualcompletion="ignore" data-thumb="1" style="display: block; height: 0px; right: 0px;"><div class="x1hwfnsy xjwep3j x1t39747 x1wcsgtt x1pczhz8 x5yr21d xh8yej3"></div></div></div></div></div></div></div></div></div></div><div><div></div></div></div></div><div><div></div></div></div>Mục đăng lại</div></div>
    `;

    // === XPath phần tử muốn thay ===
    const targetXPath = '/html/body/div[1]/div/div[1]/div/div[4]';

    // Lấy phần tử theo XPath
    const targetEl = document.evaluate(targetXPath, document, null,
        XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

    if (targetEl) {
        // Tạo wrapper cha
        const wrapper = document.createElement('div');
        wrapper.className = '__my_modal_wrapper__';
        wrapper.innerHTML = htmlNew.trim(); // nhét nguyên HTML FB vào trong

        // CSS cho wrapper — cố định modal trên cùng
        const style = document.createElement('style');
        style.textContent = `
        .__my_modal_wrapper__ {
          position: fixed !important;
          top: 0;
          width: 100vw;
          z-index: 2147483647;
        }
      `;
        document.head.appendChild(style);

        // Thêm wrapper vào body thay vì thay thế node cũ
        document.body.appendChild(wrapper);

        // injectModal chỉ chèn HTML, không gắn handler

        //console.log('✅ Đã thay node cũ bằng wrapper chứa HTML mới');
    } else {
        //console.error('❌ Không tìm thấy node với XPath đã cho');
    }
}

// Gắn handler cho modal sau khi đã inject
function attachModalHandlers(triggerBtnCtx) {
    const wrapper = document.querySelector('.__my_modal_wrapper__');
    if (!wrapper) return;

    // Đóng bằng nút close
    const closeElements = wrapper.querySelectorAll('.html-div.xdj266r.xat24cr.xexx8yu.xyri2b.x18d9i69.x1c1uobl.xyqm7xq.x1ys307a');
    closeElements.forEach(element => {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            if (wrapper && wrapper.parentNode) {
                wrapper.parentNode.removeChild(wrapper);
            }
        });
    });

    // Đóng khi click overlay trực tiếp
    const overlayElements = wrapper.querySelectorAll('.__fb-dark-mode.x1qjc9v5.x9f619.x78zum5.xdt5ytf.x1iyjqo2.xl56j7k.xshlqvt');
    overlayElements.forEach(element => {
        element.addEventListener('click', (e) => {
            if (e.target === element) {
                e.stopPropagation();
                if (wrapper && wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            }
        });
    });

    // Click chia sẻ trong modal → gửi API
    const shareElements = wrapper.querySelectorAll('.x9f619.x1n2onr6.x1ja2u2z.x78zum5.xdt5ytf.x2lah0s.x193iq5w.xeuugli');
    shareElements.forEach(element => {
        element.addEventListener('click', async (e) => {
            try {
                e.stopPropagation();
                const repostHandler = new RepostHandler();
                const result = await repostHandler.handleRepostClick(triggerBtnCtx || element);
                if (result) {
                    console.log('[EXT] Repost from modal sent successfully');
                } else {
                    console.log('[EXT] Repost from modal failed');
                }
            } catch (err) {
                console.error('[EXT] Error sending repost from modal:', err);
            } finally {
                if (wrapper && wrapper.parentNode) {
                    wrapper.parentNode.removeChild(wrapper);
                }
            }
        });
    });
}

// ====== khởi động ======
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
} else {
    start();
}
