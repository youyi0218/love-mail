return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-romantic text-pink-600">管理后台</h2>
              <div className="space-x-4">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 transition-colors"
                >
                  返回
                </button>
              </div>
            </div>

            <div className="space-y-8">
              {/* 密码设置 */}
              <div className="bg-pink-50 rounded-xl p-6">
                <h3 className="text-xl font-romantic text-pink-600 mb-4">密码设置</h3>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      当前密码
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      新密码
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      确认新密码
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-lg hover:from-pink-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? '保存中...' : '修改密码'}
                    </button>
                  </div>
                </form>
              </div>

              {/* SMTP 设置 */}
              <div className="bg-pink-50 rounded-xl p-6">
                <h3 className="text-xl font-romantic text-pink-600 mb-4">邮件设置</h3>
                <form onSubmit={handleSmtpSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP 服务器
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => setSmtpHost(e.target.value)}
                      placeholder="例如: smtp.gmail.com"
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP 端口
                    </label>
                    <input
                      type="number"
                      value={smtpPort}
                      onChange={(e) => setSmtpPort(e.target.value)}
                      placeholder="例如: 587"
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱账号
                    </label>
                    <input
                      type="email"
                      value={smtpUser}
                      onChange={(e) => setSmtpUser(e.target.value)}
                      placeholder="例如: your-email@gmail.com"
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      邮箱密码
                    </label>
                    <input
                      type="password"
                      value={smtpPass}
                      onChange={(e) => setSmtpPass(e.target.value)}
                      placeholder="邮箱密码或应用专用密码"
                      className="w-full px-4 py-2 rounded-lg border-2 border-pink-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-100 outline-none transition-all"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-6 py-2 bg-gradient-to-r from-pink-400 to-rose-400 text-white rounded-lg hover:from-pink-500 hover:to-rose-500 transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? '保存中...' : '保存设置'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  ); 