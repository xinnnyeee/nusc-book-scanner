import { useState } from 'react';

export default function BookScanner() {
  const [isbn, setIsbn] = useState('');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('1');
  const [selectedCategory, setSelectedCategory] = useState('Fiction');

  const rooms = ['1', '2', '3'];
  const categories = ['Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Self-Help', 'Reference', 'Other'];

  const fetchBookData = async (isbnValue) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=isbn:${isbnValue}`
      );
      
      if (!response.ok) throw new Error('API request failed');
      
      const data = await response.json();
      const nextId = books.length + 1;
      const createdAt = new Date().toISOString();
      
      if (data.items && data.items.length > 0) {
        const book = data.items[0].volumeInfo;
        const newBook = {
          id: nextId,
          isbn: isbnValue,
          title: book.title || 'Unknown Title',
          description: book.description || 'No description available',
          author: (book.authors && book.authors[0]) || 'Unknown Author',
          image_url: book.imageLinks?.thumbnail || '',
          room: selectedRoom,
          category: selectedCategory,
          created_at: createdAt
        };
        
        setBooks([...books, newBook]);
        setSuccess(`✓ Added "${book.title}"`);
      } else {
        setError('Book not found. No book is added');
      }
      setIsbn('');
    } catch (err) {
      setError('Error fetching book data. No book is added.');
    }
    
    setLoading(false);
  };

  const handleScan = (e) => {
    if (e.key === 'Enter' && isbn.trim()) {
      fetchBookData(isbn.trim());
    }
  };

  const handleAddButton = () => {
    if (isbn.trim()) {
      fetchBookData(isbn.trim());
    }
  };

  const updateBook = (id, field, value) => {
    setBooks(books.map(book => 
      book.id === id ? { ...book, [field]: value } : book
    ));
  };

  const deleteBook = (id) => {
    setBooks(books.filter(book => book.id !== id));
    setSuccess('✓ Book deleted');
  };

  const exportJSON = () => {
    const json = JSON.stringify(books, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `books_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    setSuccess('✓ JSON exported');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950" style={{backgroundAttachment: 'fixed'}}>
      <div className="max-w-7xl mx-auto p-8">
        <div className="grid grid-cols-3 gap-8">
          {/* Left Column - Input */}
          <div className="col-span-2">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 sticky top-8 h-fit border border-indigo-100">
              <div className="mb-8">
                <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800 mb-2">📚 Book Scanner</h1>
                <div className="h-2 w-16 bg-gradient-to-r from-indigo-600 to-indigo-400 rounded-full"></div>
              </div>

              {/* Feedback Messages */}
              {success && (
                <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg mb-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm font-semibold text-emerald-800">{success}</p>
                </div>
              )}
              
              {error && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg mb-4 animate-in fade-in slide-in-from-top-2">
                  <p className="text-sm font-semibold text-orange-800">{error}</p>
                </div>
              )}

              {/* Input Section */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">
                    ISBN Code
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={isbn}
                      onChange={(e) => setIsbn(e.target.value)}
                      onKeyPress={handleScan}
                      placeholder="Scan or paste ISBN..."
                      className="flex-1 px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                      autoFocus
                    />
                    <button
                      onClick={handleAddButton}
                      disabled={loading}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold transition transform hover:scale-105 shadow-lg"
                    >
                      {loading ? '⏳' : '➕'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Room</label>
                  <select
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white font-semibold text-gray-800 transition"
                  >
                    {rooms.map(r => <option key={r} value={r}>Room {r}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-3 uppercase tracking-wide">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white font-semibold text-gray-800 transition"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="pt-6 border-t-2 border-indigo-100">
                  <p className="text-xs font-black text-gray-700 mb-3 uppercase tracking-widest">Export Options</p>
                  <button
                    onClick={exportJSON}
                    disabled={books.length === 0}
                    className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    📥 Export JSON
                  </button>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 p-4 rounded-xl">
                  <p className="font-black text-indigo-900 mb-3">💡 Fields Exported</p>
                  <ul className="text-sm text-indigo-800 space-y-1 font-medium">
                    <li>✓ ID (auto-incremented)</li>
                    <li>✓ ISBN</li>
                    <li>✓ Title</li>
                    <li>✓ Description</li>
                    <li>✓ Author</li>
                    <li>✓ Image URL</li>
                    <li>✓ Created At</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Books Table */}
          <div className="col-span-2">
            <div className="bg-white/95 backdrop-blur rounded-2xl shadow-2xl p-8 border border-indigo-100 max-h-screen overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-2xl font-black text-gray-900">
                  Books Added <span className="text-indigo-600">({books.length})</span>
                </h2>
              </div>

              {books.length === 0 ? (
                <div className="text-center py-20 px-8">
                  <p className="text-5xl mb-4">📚</p>
                  <p className="text-xl font-bold text-gray-600">No books scanned yet</p>
                  <p className="text-gray-500 mt-2">Start scanning ISBNs on the left panel</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {books.map((book) => (
                    <div key={book.id} className="border-2 border-indigo-100 rounded-xl p-5 hover:border-indigo-300 hover:bg-indigo-50 transition">
                      <div className="grid grid-cols-4 gap-4">
                        {/* Left - Image */}
                        <div className="col-span-1">
                          {book.image_url ? (
                            <img 
                              src={book.image_url} 
                              alt={book.title}
                              className="w-full h-32 object-cover rounded-lg border border-gray-200"
                            />
                          ) : (
                            <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                              📕
                            </div>
                          )}
                        </div>

                        {/* Right - Details */}
                        <div className="col-span-3 space-y-3">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-xs font-bold text-gray-600 uppercase">ID</label>
                              <p className="text-lg font-bold text-indigo-600">{book.id}</p>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-600 uppercase">ISBN</label>
                              <input
                                type="text"
                                value={book.isbn}
                                onChange={(e) => updateBook(book.id, 'isbn', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-600 uppercase">Title</label>
                            <input
                              type="text"
                              value={book.title}
                              onChange={(e) => updateBook(book.id, 'title', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-semibold"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-600 uppercase">Author</label>
                            <input
                              type="text"
                              value={book.author}
                              onChange={(e) => updateBook(book.id, 'author', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            />
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-600 uppercase">Description</label>
                            <textarea
                              value={book.description}
                              onChange={(e) => updateBook(book.id, 'description', e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs h-16 resize-none"
                              placeholder="Book description..."
                            />
                          </div>

                          <div className="grid grid-cols-3 gap-3 items-end">
                            <div>
                              <label className="text-xs font-bold text-gray-600 uppercase">Room</label>
                              <select
                                value={book.room}
                                onChange={(e) => updateBook(book.id, 'room', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-bold"
                              >
                                {rooms.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs font-bold text-gray-600 uppercase">Category</label>
                              <select
                                value={book.category}
                                onChange={(e) => updateBook(book.id, 'category', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-bold"
                              >
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                              </select>
                            </div>
                            <button
                              onClick={() => deleteBook(book.id)}
                              className="px-3 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition font-bold"
                            >
                              Delete
                            </button>
                          </div>

                          <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                            Added: {new Date(book.created_at).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}