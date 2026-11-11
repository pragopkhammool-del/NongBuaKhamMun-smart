import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Plus, 
  Send, 
  Trash2, 
  User, 
  Clock, 
  X,
  MessageCircle,
  ShieldAlert
} from 'lucide-react';
import type { CommunityPost, PostComment, UserProfile } from '../types';
import { 
  createCommunityPost, 
  likeCommunityPost, 
  deleteCommunityPost, 
  addComment, 
  subscribeComments 
} from '../services/villageService';

interface ForumTabProps {
  posts: CommunityPost[];
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
}

export const ForumTab: React.FC<ForumTabProps> = ({ posts, currentUser, onOpenAuth }) => {
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [isAddPostModalOpen, setIsAddPostModalOpen] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [authorName, setAuthorName] = useState(currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.role === 'SUPER_ADMIN' || currentUser?.email === 'pragopkhammool@gmail.com';

  // Subscribe to comments for selected post
  useEffect(() => {
    if (selectedPost) {
      const unsub = subscribeComments(selectedPost.id, (loadedComments) => {
        setComments(loadedComments);
      });
      return () => unsub();
    } else {
      setComments([]);
    }
  }, [selectedPost]);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!title.trim() || !content.trim()) return;

    setIsSubmitting(true);
    try {
      await createCommunityPost({
        title: title.trim(),
        content: content.trim(),
        authorName: authorName.trim() || 'ชาวบ้าน ม.4',
        authorId: currentUser.uid,
        createdAt: new Date().toISOString()
      });

      setIsAddPostModalOpen(false);
      setTitle('');
      setContent('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการตั้งกระทู้: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (post: CommunityPost) => {
    try {
      await likeCommunityPost(post.id, post.likesCount || 0);
    } catch (err: any) {
      console.warn('Like error:', err);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('ยืนยันลบกระทู้นี้?')) return;
    try {
      await deleteCommunityPost(postId);
      if (selectedPost?.id === postId) {
        setSelectedPost(null);
      }
    } catch (err: any) {
      alert('ไม่สามารถลบได้: ' + err.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onOpenAuth();
      return;
    }
    if (!selectedPost || !newCommentText.trim()) return;

    try {
      await addComment({
        postId: selectedPost.id,
        authorName: currentUser.firstName ? `${currentUser.firstName} ${currentUser.lastName}` : 'ชาวบ้าน ม.4',
        authorId: currentUser.uid,
        content: newCommentText.trim(),
        createdAt: new Date().toISOString()
      });
      setNewCommentText('');
    } catch (err: any) {
      alert('เกิดข้อผิดพลาดในการแสดงความเห็น: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fadeIn max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#164B3C] to-[#23865B] rounded-3xl p-6 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-6 h-6 text-emerald-300" />
            <h1 className="text-xl sm:text-2xl font-extrabold">กระดานประชาคม People's Forum</h1>
          </div>
          <p className="text-xs sm:text-sm text-emerald-100 mt-1">
            พื้นที่แลกเปลี่ยนความคิดเห็น เสนอแนะการพัฒนาหมู่บ้านหนองบัวคำมูล ม.4 ร่วมกัน
          </p>
        </div>

        <button
          onClick={() => {
            if (!currentUser) onOpenAuth();
            else setIsAddPostModalOpen(true);
          }}
          className="flex items-center space-x-1.5 bg-amber-400 hover:bg-amber-300 text-slate-900 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-2xl shadow-md transition-transform active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ตั้งกระทู้ใหม่</span>
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-100 text-slate-400">
            <MessageSquare className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
            <p className="text-sm">ยังไม่มีกระทู้พูดคุย ขอเชิญเป็นท่านแรกที่เปิดประเด็นครับ</p>
          </div>
        ) : (
          posts.map(post => {
            const isAuthor = currentUser?.uid === post.authorId || isAdmin;
            return (
              <div
                key={post.id}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-[#164B3C] font-bold text-xs flex items-center justify-center border border-emerald-100">
                      {post.authorName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{post.authorName}</h4>
                      <span className="text-[10px] text-slate-400">
                        {new Date(post.createdAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>

                  {isAuthor && (
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="ลบกระทู้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-base text-slate-900 leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {post.content}
                </p>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleLike(post)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-[#164B3C] transition-colors"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>ถูกใจ {post.likesCount || 0}</span>
                    </button>

                    <button
                      onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
                      className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-colors"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>ความคิดเห็น ({post.commentsCount || 0})</span>
                    </button>
                  </div>
                </div>

                {/* Inline Comment Section */}
                {selectedPost?.id === post.id && (
                  <div className="pt-3 border-t border-slate-100 space-y-3 animate-fadeIn">
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {comments.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-2">
                          ยังไม่มีความคิดเห็น มาร่วมแสดงความเห็นแรกกันครับ
                        </p>
                      ) : (
                        comments.map(c => (
                          <div key={c.id} className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                            <div className="flex items-center justify-between text-[11px] mb-1">
                              <span className="font-bold text-slate-700">{c.authorName}</span>
                              <span className="text-slate-400">
                                {new Date(c.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{c.content}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Comment input */}
                    <form onSubmit={handleAddComment} className="flex gap-2">
                      <input
                        type="text"
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        placeholder="เขียนความคิดเห็นของคุณ..."
                        className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#23865B]"
                      />
                      <button
                        type="submit"
                        disabled={!newCommentText.trim()}
                        className="px-3.5 py-2 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white text-xs font-semibold disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Post Modal */}
      {isAddPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setIsAddPostModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-slate-900 mb-4">เปิดประเด็นกระทู้ประชาคม</h2>

            <form onSubmit={handleCreatePost} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">หัวข้อกระทู้ *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น เสนอแนะจุดทิ้งขยะอันตราย, ขอขอบคุณทีมงาน..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ชื่อผู้ตั้งกระทู้</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="เช่น สมศักดิ์ ซอย 2"
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">เนื้อหาความคิดเห็น *</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="แบ่งปันความคิดเห็นด้วยความสุภาพและสร้างสรรค์เพื่อชุมชนของเรา..."
                  className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                ระบบมีระบบตรวจสอบข้อความไม่เหมาะสม และขอความร่วมมือใช้ถ้อยคำสุภาพ
              </p>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 py-2.5 rounded-xl bg-[#164B3C] hover:bg-[#23865B] text-white font-bold text-sm shadow-md"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'เผยแพร่กระทู้'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
