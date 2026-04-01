import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

function getInitial(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

function formatTime(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDateTime(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MessagesPage() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [dsHoiThoai, setDsHoiThoai] = useState([]);
  const [idHoiThoai, setIdHoiThoai] = useState(userId ? Number(userId) : null);
  const [dsTinNhan, setDsTinNhan] = useState([]);
  const [chuoiTinNhan, setChuoiTinNhan] = useState('');
  const [dangTaiHoiThoai, setDangTaiHoiThoai] = useState(true);
  const [dangTaiTinNhan, setDangTaiTinNhan] = useState(false);
  const [dangGui, setDangGui] = useState(false);
  const [loi, setLoi] = useState('');
  const [ghiChu, setGhiChu] = useState('');
  const [moDanhSachMobile, setMoDanhSachMobile] = useState(false);
  const msgEndRef = useRef(null);

  useEffect(() => {
    taiDanhSachHoiThoai();
  }, []);

  useEffect(() => {
    if (userId) {
      setIdHoiThoai(Number(userId));
    }
  }, [userId]);

  useEffect(() => {
    if (idHoiThoai) {
      layDuLieuChat(idHoiThoai);
    }
  }, [idHoiThoai]);

  useEffect(() => {
    if (msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [dsTinNhan]);

  async function taiDanhSachHoiThoai() {
    setDangTaiHoiThoai(true);
    setLoi('');

    try {
      const res = await api.getConversations();
      setDsHoiThoai(Array.isArray(res) ? res : []);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTaiHoiThoai(false);
    }
  }

  async function layDuLieuChat(chatId) {
    setDangTaiTinNhan(true);
    setLoi('');

    try {
      const msgs = await api.getMessages(chatId);
      setDsTinNhan(Array.isArray(msgs) ? msgs : []);
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangTaiTinNhan(false);
    }
  }

  async function guiTinDi() {
    if (!chuoiTinNhan.trim() || !idHoiThoai) {
      return;
    }

    setDangGui(true);
    setLoi('');
    setGhiChu('');

    try {
      const data = await api.sendMessage(idHoiThoai, chuoiTinNhan.trim());
      setDsTinNhan((prev) => [...prev, data]);
      setChuoiTinNhan('');
      setGhiChu('Da gui tin nhan.');
      await taiDanhSachHoiThoai();
    } catch (err) {
      setLoi(err.message);
    } finally {
      setDangGui(false);
    }
  }

  const nguoiDangChat = useMemo(
    () => dsHoiThoai.find((item) => Number(item.user_id) === Number(idHoiThoai))?.user || null,
    [dsHoiThoai, idHoiThoai]
  );

  const thongKe = useMemo(
    () => [
      { label: 'Hoi thoai', value: dsHoiThoai.length, tone: 'text-[var(--accent-forest)]' },
      { label: 'Dang chat', value: idHoiThoai ? 1 : 0, tone: 'text-[var(--accent)]' },
      { label: 'Tin nhan', value: dsTinNhan.length, tone: 'text-[var(--text-strong)]' },
    ],
    [dsHoiThoai.length, idHoiThoai, dsTinNhan.length]
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)] sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(14,101,91,0.18),transparent_52%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
          <div className="space-y-4">
            <p className="section-tag mb-0">Messages Hub</p>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              Nhan tin nhanh, xem hoi thoai ro rang va giu nhac dieu hien dai cho app.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">
              Trang tin nhan nay da duoc phoi lai bang Tailwind CSS cho bo cuc linh hoat, ket hop Headless UI de xu ly
              menu thao tac, khu huong dan va danh sach hoi thoai tren mobile.
            </p>
            <Disclosure as="div" className="rounded-3xl border border-[var(--stroke)] bg-white/60 p-4 dark:bg-white/5">
              <DisclosureButton className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-[var(--text-strong)]">
                <span>Huong dan su dung nhanh</span>
                <span className="text-[var(--text-muted)]">Mo rong</span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-soft)]">
                <p>Chon mot hoi thoai o cot trai de tai lich su tin nhan va danh dau da doc.</p>
                <p>Tren man hinh nho, ban co the mo danh sach hoi thoai bang nut o khu thao tac ben phai.</p>
              </DisclosurePanel>
            </Disclosure>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {thongKe.map((item) => (
              <article
                key={item.label}
                className="rounded-[24px] border border-[var(--stroke)] bg-white/65 p-4 shadow-sm dark:bg-white/5"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">{item.label}</p>
                <p className={`mt-3 text-3xl font-black ${item.tone}`}>{item.value}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {ghiChu ? (
        <div className="rounded-2xl border border-emerald-600/15 bg-emerald-600/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {ghiChu}
        </div>
      ) : null}

      {loi ? (
        <div className="rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {loi}
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="hidden overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] shadow-[var(--card-shadow)] xl:flex xl:flex-col">
          <div className="border-b border-[var(--stroke)] px-5 py-4">
            <p className="section-tag mb-1">Danh sach</p>
            <h2 className="text-xl font-black text-[var(--text-strong)]">Hoi thoai gan day</h2>
          </div>

          <div className="max-h-[720px] overflow-y-auto p-3">
            {dangTaiHoiThoai ? (
              <div className="rounded-3xl border border-dashed border-[var(--stroke-strong)] px-4 py-8 text-center text-sm text-[var(--text-soft)]">
                Dang tai danh sach hoi thoai...
              </div>
            ) : dsHoiThoai.length ? (
              <div className="space-y-3">
                {dsHoiThoai.map((item) => {
                  const dangChon = Number(idHoiThoai) === Number(item.user_id);
                  const tenNguoiDung = item.user?.display_name || item.user?.username || `User ${item.user_id}`;

                  return (
                    <button
                      key={item.user_id}
                      type="button"
                      className={[
                        'w-full rounded-[24px] border p-4 text-left transition',
                        dangChon
                          ? 'border-[var(--accent)] bg-[rgba(209,111,52,0.14)] shadow-[0_14px_30px_rgba(209,111,52,0.18)]'
                          : 'border-[var(--stroke)] bg-white/55 hover:bg-white/80 dark:bg-white/5',
                      ].join(' ')}
                      onClick={() => setIdHoiThoai(Number(item.user_id))}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-forest),#0f7f72)] text-sm font-black text-white">
                          {getInitial(tenNguoiDung)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="truncate text-sm font-bold text-[var(--text-strong)]">{tenNguoiDung}</p>
                            {item.unread > 0 ? (
                              <span className="rounded-full bg-[var(--accent)] px-2.5 py-1 text-[11px] font-bold text-white">
                                {item.unread}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--text-soft)]">
                            {item.last_message || 'Chua co noi dung xem truoc.'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[var(--stroke-strong)] px-4 py-8 text-center text-sm text-[var(--text-soft)]">
                Chua co hoi thoai nao. Hay ket ban va bat dau nhan tin.
              </div>
            )}
          </div>
        </aside>

        <section className="overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] shadow-[var(--card-shadow)]">
          <div className="border-b border-[var(--stroke)] px-5 py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <p className="section-tag mb-1">Active chat</p>
                <h2 className="truncate text-2xl font-black text-[var(--text-strong)]">
                  {nguoiDangChat?.display_name || nguoiDangChat?.username || 'Chon mot hoi thoai'}
                </h2>
                <p className="mt-1 text-sm text-[var(--text-soft)]">
                  {nguoiDangChat
                    ? `Dang tro chuyen voi @${nguoiDangChat.username || nguoiDangChat.display_name || idHoiThoai}`
                    : 'Chon mot hoi thoai o danh sach de mo lich su nhan tin.'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full border border-[var(--stroke-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-strong)] xl:hidden"
                  onClick={() => setMoDanhSachMobile(true)}
                >
                  Mo hoi thoai
                </button>

                <Menu as="div" className="relative">
                  <MenuButton className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(209,111,52,0.26)]">
                    Thao tac
                  </MenuButton>
                  <MenuItems
                    anchor="bottom end"
                    className="w-56 rounded-2xl border border-[var(--stroke)] bg-[var(--panel)] p-2 shadow-[var(--card-shadow)] outline-none"
                  >
                    <MenuItem>
                      <button
                        type="button"
                        className="block w-full rounded-xl px-3 py-2 text-left text-sm text-[var(--text-strong)] data-[focus]:bg-white/70 dark:data-[focus]:bg-white/8"
                        onClick={taiDanhSachHoiThoai}
                      >
                        Tai lai danh sach hoi thoai
                      </button>
                    </MenuItem>
                    <MenuItem>
                      <Link
                        to="/friends"
                        className="block rounded-xl px-3 py-2 text-sm text-[var(--text-strong)] data-[focus]:bg-white/70 dark:data-[focus]:bg-white/8"
                      >
                        Mo trang ban be
                      </Link>
                    </MenuItem>
                  </MenuItems>
                </Menu>
              </div>
            </div>
          </div>

          {idHoiThoai ? (
            <>
              <div className="max-h-[560px] min-h-[420px] space-y-4 overflow-y-auto px-5 py-5">
                {dangTaiTinNhan ? (
                  <div className="rounded-3xl border border-dashed border-[var(--stroke-strong)] px-4 py-10 text-center text-sm text-[var(--text-soft)]">
                    Dang tai lich su tin nhan...
                  </div>
                ) : dsTinNhan.length ? (
                  dsTinNhan.map((m) => {
                    const laTinCuaToi = Number(m.sender_id) === Number(user?.id);

                    return (
                      <div key={m.id} className={`flex ${laTinCuaToi ? 'justify-end' : 'justify-start'}`}>
                        <div
                          className={[
                            'max-w-[82%] rounded-[24px] px-4 py-3 text-sm shadow-sm sm:max-w-[70%]',
                            laTinCuaToi
                              ? 'bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-white'
                              : 'border border-[var(--stroke)] bg-white/70 text-[var(--text-strong)] dark:bg-white/5',
                          ].join(' ')}
                        >
                          <p className="leading-6">{m.content}</p>
                          <p className={`mt-2 text-[11px] font-medium ${laTinCuaToi ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                            {formatTime(m.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-3xl border border-dashed border-[var(--stroke-strong)] px-4 py-10 text-center text-sm text-[var(--text-soft)]">
                    Chua co tin nhan nao trong hoi thoai nay. Hay gui mot loi chao dau tien.
                  </div>
                )}
                <div ref={msgEndRef} />
              </div>

              <div className="border-t border-[var(--stroke)] px-5 py-4">
                <div className="mb-3 rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 text-sm text-[var(--text-soft)] dark:bg-white/5">
                  Lan cap nhat gan nhat: {dsTinNhan.at(-1)?.created_at ? formatDateTime(dsTinNhan.at(-1).created_at) : 'Chua co du lieu'}
                </div>
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    className="w-full rounded-2xl border border-[var(--stroke)] bg-white/70 px-4 py-3 text-sm text-[var(--text-strong)] outline-none ring-0 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] dark:bg-white/5"
                    value={chuoiTinNhan}
                    onChange={(e) => setChuoiTinNhan(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        guiTinDi();
                      }
                    }}
                    placeholder="Nhap tin nhan cua ban..."
                  />
                  <button
                    type="button"
                    className="inline-flex min-w-[140px] items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(209,111,52,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
                    onClick={guiTinDi}
                    disabled={dangGui || !chuoiTinNhan.trim()}
                  >
                    {dangGui ? 'Dang gui...' : 'Gui tin'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[560px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-3xl font-black text-white">
                M
              </div>
              <div className="max-w-md space-y-2">
                <h3 className="text-2xl font-black text-[var(--text-strong)]">Chon mot hoi thoai de bat dau</h3>
                <p className="text-sm leading-7 text-[var(--text-soft)]">
                  Ban co the mo danh sach hoi thoai o cot trai, hoac vao trang ban be de ket noi va tao cuoc tro chuyen moi.
                </p>
              </div>
              <Link
                to="/friends"
                className="inline-flex items-center justify-center rounded-full bg-[var(--accent-forest)] px-5 py-3 text-sm font-semibold text-white"
              >
                Mo trang ban be
              </Link>
            </div>
          )}
        </section>
      </div>

      <Dialog open={moDanhSachMobile} onClose={setMoDanhSachMobile} className="relative z-50 xl:hidden">
        <DialogBackdrop className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-end justify-center p-4 sm:items-center">
          <DialogPanel className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] shadow-[var(--card-shadow)]">
            <div className="flex items-center justify-between border-b border-[var(--stroke)] px-5 py-4">
              <div>
                <p className="section-tag mb-1">Mobile list</p>
                <DialogTitle className="text-xl font-black text-[var(--text-strong)]">Chon hoi thoai</DialogTitle>
              </div>
              <button
                type="button"
                className="rounded-full border border-[var(--stroke-strong)] px-3 py-1.5 text-sm font-semibold text-[var(--text-strong)]"
                onClick={() => setMoDanhSachMobile(false)}
              >
                Dong
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-4">
              {dsHoiThoai.length ? (
                <div className="space-y-3">
                  {dsHoiThoai.map((item) => (
                    <button
                      key={item.user_id}
                      type="button"
                      className="w-full rounded-[24px] border border-[var(--stroke)] bg-white/55 p-4 text-left transition hover:bg-white/80 dark:bg-white/5"
                      onClick={() => {
                        setIdHoiThoai(Number(item.user_id));
                        setMoDanhSachMobile(false);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-forest),#0f7f72)] text-sm font-black text-white">
                          {getInitial(item.user?.display_name || item.user?.username)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-[var(--text-strong)]">
                            {item.user?.display_name || item.user?.username || `User ${item.user_id}`}
                          </p>
                          <p className="mt-1 truncate text-sm text-[var(--text-soft)]">
                            {item.last_message || 'Chua co noi dung xem truoc.'}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-[var(--stroke-strong)] px-4 py-10 text-center text-sm text-[var(--text-soft)]">
                  Chua co hoi thoai nao de hien thi.
                </div>
              )}
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
