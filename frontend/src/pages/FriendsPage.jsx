import {
  Description,
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../contexts/AuthContext';

function getInitial(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?';
}

function formatDate(value) {
  if (!value) {
    return '';
  }

  return new Date(value).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function tabClass(selected) {
  return [
    'rounded-full px-4 py-2 text-sm font-semibold transition',
    selected
      ? 'bg-[var(--accent)] text-white shadow-[0_14px_30px_rgba(209,111,52,0.28)]'
      : 'bg-white/60 text-[var(--text-soft)] ring-1 ring-[var(--stroke)] hover:bg-white/85 dark:bg-white/5',
  ].join(' ');
}

export default function FriendsPage() {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [friendToRemove, setFriendToRemove] = useState(null);

  useEffect(() => {
    loadFriendData();
  }, []);

  async function loadFriendData() {
    setLoading(true);
    setError('');

    try {
      const [friendRows, pendingRows] = await Promise.all([
        api.getFriends(),
        api.getPendingRequests(),
      ]);

      setFriends(friendRows);
      setPending(pendingRows);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    setError('');

    try {
      const users = await api.searchUsers(searchQuery.trim());
      setSearchResults(users.filter((candidate) => candidate.id !== user?.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setSearching(false);
    }
  }

  async function handleSendRequest(targetId) {
    setError('');
    setNotice('');

    try {
      await api.sendFriendRequest(targetId);
      setNotice('Da gui loi moi ket ban.');
      await loadFriendData();
      await handleSearch();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRespond(requestId, action) {
    setError('');
    setNotice('');

    try {
      await api.respondFriendRequest(requestId, action);
      setNotice(action === 'accept' ? 'Da chap nhan loi moi ket ban.' : 'Da tu choi loi moi ket ban.');
      await loadFriendData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRemoveFriend() {
    if (!friendToRemove) {
      return;
    }

    setError('');
    setNotice('');

    try {
      await api.removeFriend(friendToRemove.friendship_id);
      setNotice(`Da go ${friendToRemove.friend.display_name || friendToRemove.friend.username} khoi danh sach ban be.`);
      setFriendToRemove(null);
      await loadFriendData();
    } catch (err) {
      setError(err.message);
    }
  }

  const summary = useMemo(() => ([
    { label: 'Ban be', value: friends.length, tone: 'text-[var(--accent-forest)]' },
    { label: 'Loi moi cho', value: pending.length, tone: 'text-[var(--accent)]' },
    { label: 'Ket qua tim', value: searchResults.length, tone: 'text-[var(--text-strong)]' },
  ]), [friends.length, pending.length, searchResults.length]);

  const friendIds = useMemo(
    () => new Set(friends.map((item) => Number(item.friend?.id)).filter(Boolean)),
    [friends]
  );

  const pendingSenderIds = useMemo(
    () => new Set(pending.map((item) => Number(item.sender_id)).filter(Boolean)),
    [pending]
  );

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)] sm:p-8">
        <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(209,111,52,0.18),transparent_52%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.8fr)]">
          <div className="space-y-4">
            <p className="section-tag mb-0">Friends Hub</p>
            <h1 className="text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-5xl">
              Quan ly ket noi, loi moi va tim ban moi trong cung mot noi.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-[var(--text-soft)] sm:text-base">
              Trang nay dung Tailwind CSS cho layout linh hoat va Headless UI de to chuc trai nghiem theo tung phan:
              danh sach ban be, loi moi dang cho, va khu vuc tim kiem nguoi dung.
            </p>
            <Disclosure as="div" className="rounded-3xl border border-[var(--stroke)] bg-white/60 p-4 dark:bg-white/5">
              <DisclosureButton className="flex w-full items-center justify-between gap-4 text-left text-sm font-semibold text-[var(--text-strong)]">
                <span>Meo dung nhanh cho trang ban be</span>
                <span className="text-[var(--text-muted)]">Mo rong</span>
              </DisclosureButton>
              <DisclosurePanel className="mt-3 space-y-2 text-sm leading-6 text-[var(--text-soft)]">
                <p>Tim theo username hoac display name de gui loi moi ket ban.</p>
                <p>Phan ban be va loi moi se tu dong lam moi sau cac thao tac chap nhan, tu choi hoac go ban.</p>
              </DisclosurePanel>
            </Disclosure>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {summary.map((item) => (
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

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        <article className="rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="section-tag mb-1">Tong quan</p>
              <h2 className="text-xl font-black text-[var(--text-strong)]">Khu ban be dang o trang thai kha tot</h2>
            </div>
            <span className="rounded-full bg-[rgba(14,101,91,0.12)] px-3 py-1 text-xs font-semibold text-[var(--accent-forest)]">
              Social module
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm leading-6 text-[var(--text-soft)] sm:grid-cols-3">
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 dark:bg-white/5">
              <p className="font-semibold text-[var(--text-strong)]">Ket noi hien co</p>
              <p className="mt-1">Ban da co {friends.length} ket noi san sang de mo tin nhan.</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 dark:bg-white/5">
              <p className="font-semibold text-[var(--text-strong)]">Loi moi can xu ly</p>
              <p className="mt-1">{pending.length ? `Co ${pending.length} loi moi dang cho ban phan hoi.` : 'Hien tai khong co loi moi nao dang cho.'}</p>
            </div>
            <div className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 dark:bg-white/5">
              <p className="font-semibold text-[var(--text-strong)]">Tim ban nhanh</p>
              <p className="mt-1">Dung khu tim kiem de gui loi moi ma khong can roi khoi trang nay.</p>
            </div>
          </div>
        </article>

        <article className="rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
          <p className="section-tag mb-1">Quick Actions</p>
          <div className="space-y-3">
            <Link
              to="/messages"
              className="flex items-center justify-between rounded-2xl border border-[var(--stroke)] bg-white/60 px-4 py-3 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-white/90 dark:bg-white/5"
            >
              <span>Mo khu tin nhan</span>
              <span className="text-[var(--text-muted)]">/messages</span>
            </Link>
            <button
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-[var(--stroke)] bg-white/60 px-4 py-3 text-sm font-semibold text-[var(--text-strong)] transition hover:bg-white/90 dark:bg-white/5"
              onClick={loadFriendData}
            >
              <span>Tai lai du lieu ban be</span>
              <span className="text-[var(--text-muted)]">Refresh</span>
            </button>
          </div>
        </article>
      </section>

      {notice ? (
        <div className="rounded-2xl border border-emerald-600/15 bg-emerald-600/10 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-2xl border border-red-500/15 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <TabGroup>
        <TabList className="flex flex-wrap gap-3 rounded-[24px] border border-[var(--stroke)] bg-[var(--panel)] p-3 shadow-[var(--card-shadow)]">
          <Tab className={({ selected }) => tabClass(selected)}>Ban be ({friends.length})</Tab>
          <Tab className={({ selected }) => tabClass(selected)}>Loi moi ({pending.length})</Tab>
          <Tab className={({ selected }) => tabClass(selected)}>Tim kiem</Tab>
        </TabList>

        <TabPanels className="mt-6">
          <TabPanel className="space-y-4">
            {loading ? (
              <div className="rounded-[28px] border border-dashed border-[var(--stroke-strong)] bg-[var(--panel)] px-6 py-12 text-center text-[var(--text-soft)]">
                Dang tai danh sach ban be...
              </div>
            ) : friends.length ? (
              <div className="grid gap-4 xl:grid-cols-2">
                {friends.map((item) => (
                  <article
                    key={item.friendship_id}
                    className="overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] shadow-[var(--card-shadow)]"
                  >
                    <div className="border-b border-[var(--stroke)] bg-[linear-gradient(135deg,rgba(14,101,91,0.16),rgba(255,255,255,0.06))] px-5 py-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-4">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-forest),#0f7f72)] text-lg font-black text-white">
                            {getInitial(item.friend.display_name || item.friend.username)}
                          </div>
                          <div className="min-w-0">
                            <h2 className="truncate text-lg font-bold text-[var(--text-strong)]">
                              {item.friend.display_name || item.friend.username}
                            </h2>
                            <p className="text-sm text-[var(--text-muted)]">@{item.friend.username}</p>
                          </div>
                        </div>
                        <span className="rounded-full bg-[rgba(14,101,91,0.12)] px-3 py-1 text-xs font-semibold text-[var(--accent-forest)]">
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-5 p-5">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Ket noi tu
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">{formatDate(item.created_at)}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 dark:bg-white/5">
                          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                            Biet danh
                          </p>
                          <p className="mt-2 text-sm font-semibold text-[var(--text-strong)]">
                            {item.nickname || 'Chua dat biet danh'}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-dashed border-[var(--stroke-strong)] px-4 py-3 text-sm leading-6 text-[var(--text-soft)]">
                        {item.friend.bio || 'Nguoi ban nay chua them phan gioi thieu. Ban co the mo khung nhan tin de bat dau tro chuyen.'}
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={`/messages/${item.friend.id}`}
                          className="inline-flex items-center justify-center rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(209,111,52,0.26)]"
                        >
                          Nhan tin
                        </Link>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-300"
                          onClick={() => setFriendToRemove(item)}
                        >
                          Go ban
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--stroke-strong)] bg-[var(--panel)] px-6 py-12 text-center text-[var(--text-soft)]">
                Ban chua co ban be nao. Hay thu tim kiem nguoi dung o tab ben canh.
              </div>
            )}
          </TabPanel>

          <TabPanel className="space-y-4">
            {loading ? (
              <div className="rounded-[28px] border border-dashed border-[var(--stroke-strong)] bg-[var(--panel)] px-6 py-12 text-center text-[var(--text-soft)]">
                Dang tai loi moi ket ban...
              </div>
            ) : pending.length ? (
              <div className="grid gap-4">
                {pending.map((request) => (
                  <article
                    key={request.id}
                    className="overflow-hidden rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] shadow-[var(--card-shadow)]"
                  >
                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent),var(--accent-deep))] text-lg font-black text-white">
                          {getInitial(request.display_name || request.username)}
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-[var(--text-strong)]">
                            {request.display_name || request.username}
                          </h2>
                          <p className="text-sm text-[var(--text-muted)]">@{request.username}</p>
                          <p className="mt-1 text-sm text-[var(--text-soft)]">Gui ngay {formatDate(request.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full bg-[var(--accent-forest)] px-4 py-2 text-sm font-semibold text-white"
                          onClick={() => handleRespond(request.id, 'accept')}
                        >
                          Dong y
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-300"
                          onClick={() => handleRespond(request.id, 'reject')}
                        >
                          Tu choi
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--stroke-strong)] bg-[var(--panel)] px-6 py-12 text-center text-[var(--text-soft)]">
                Khong co loi moi nao dang cho phan hoi.
              </div>
            )}
          </TabPanel>

          <TabPanel className="space-y-5">
            <section className="rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <p className="mb-2 text-sm font-semibold text-[var(--text-strong)]">Tim nguoi dung moi</p>
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="w-full rounded-2xl border border-[var(--stroke)] bg-white/70 px-4 py-3 text-sm text-[var(--text-strong)] outline-none ring-0 placeholder:text-[var(--text-muted)] focus:border-[var(--accent)] dark:bg-white/5"
                      placeholder="Tim theo username hoac ten hien thi"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          handleSearch();
                        }
                      }}
                    />
                    <button
                      type="button"
                      className="inline-flex min-w-[140px] items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(209,111,52,0.28)]"
                      onClick={handleSearch}
                    >
                      {searching ? 'Dang tim...' : 'Tim kiem'}
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--stroke)] bg-white/55 px-4 py-3 text-sm leading-6 text-[var(--text-soft)] dark:bg-white/5 lg:max-w-xs">
                  Ket qua tim kiem se bo qua tai khoan cua ban va hien thi trang thai phu hop de tranh gui loi moi trung lap.
                </div>
              </div>
            </section>

            {searchResults.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {searchResults.map((candidate) => {
                  const alreadyFriend = friendIds.has(Number(candidate.id));
                  const waitingResponse = pendingSenderIds.has(Number(candidate.id));

                  return (
                    <article
                      key={candidate.id}
                      className="rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] p-5 shadow-[var(--card-shadow)]"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#d16f34,#9a471a)] text-lg font-black text-white">
                          {getInitial(candidate.display_name || candidate.username)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="truncate text-lg font-bold text-[var(--text-strong)]">
                            {candidate.display_name || candidate.username}
                          </h2>
                          <p className="text-sm text-[var(--text-muted)]">@{candidate.username}</p>
                          <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--text-soft)]">
                            {candidate.bio || 'Nguoi dung nay chua cap nhat phan gioi thieu.'}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {alreadyFriend ? (
                              <span className="rounded-full bg-[rgba(14,101,91,0.12)] px-3 py-1 text-xs font-semibold text-[var(--accent-forest)]">
                                Da la ban be
                              </span>
                            ) : null}
                            {waitingResponse ? (
                              <span className="rounded-full bg-[rgba(209,111,52,0.12)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
                                Dang co loi moi cho xu ly
                              </span>
                            ) : null}
                            <span className="rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[var(--text-soft)] ring-1 ring-[var(--stroke)] dark:bg-white/5">
                              ID #{candidate.id}
                            </span>
                          </div>

                          <div className="mt-5">
                            <button
                              type="button"
                              disabled={alreadyFriend || waitingResponse}
                              className={[
                                'inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition',
                                alreadyFriend || waitingResponse
                                  ? 'cursor-not-allowed bg-slate-300 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                  : 'bg-[var(--accent)] text-white shadow-[0_12px_26px_rgba(209,111,52,0.26)]',
                              ].join(' ')}
                              onClick={() => handleSendRequest(candidate.id)}
                            >
                              {alreadyFriend ? 'Da ket noi' : waitingResponse ? 'Cho ban phan hoi' : 'Gui loi moi'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[28px] border border-dashed border-[var(--stroke-strong)] bg-[var(--panel)] px-6 py-12 text-center text-[var(--text-soft)]">
                {searchQuery.trim() ? 'Chua co ket qua phu hop. Hay thu tu khoa khac.' : 'Nhap tu khoa de bat dau tim kiem ban be.'}
              </div>
            )}
          </TabPanel>
        </TabPanels>
      </TabGroup>

      <Dialog open={Boolean(friendToRemove)} onClose={setFriendToRemove} className="relative z-50">
        <DialogBackdrop className="fixed inset-0 bg-slate-950/45 backdrop-blur-sm" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <DialogPanel className="w-full max-w-md rounded-[28px] border border-[var(--stroke)] bg-[var(--panel)] p-6 shadow-[var(--card-shadow)]">
            <p className="section-tag mb-2">Xac nhan</p>
            <DialogTitle className="text-2xl font-black text-[var(--text-strong)]">
              Go ban khoi danh sach?
            </DialogTitle>
            <Description className="mt-3 text-sm leading-6 text-[var(--text-soft)]">
              {friendToRemove
                ? `Ban sap go ${friendToRemove.friend.display_name || friendToRemove.friend.username}. Cuoc tro chuyen cu van con nhung hai ben se khong con la ban be nua.`
                : ''}
            </Description>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white"
                onClick={handleRemoveFriend}
              >
                Xac nhan go ban
              </button>
              <button
                type="button"
                className="inline-flex flex-1 items-center justify-center rounded-full border border-[var(--stroke-strong)] px-4 py-2 text-sm font-semibold text-[var(--text-strong)]"
                onClick={() => setFriendToRemove(null)}
              >
                Huy
              </button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </div>
  );
}
