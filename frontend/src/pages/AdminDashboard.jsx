import { useState, useEffect, useCallback } from 'react';
import { getAdmins, getAllComplaints, getComplaintDetails, updateComplaintStatus } from '../services/api';

function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [stats, setStats] = useState({ pending: 0, in_progress: 0, resolved: 0, rejected: 0 });
  const [admins, setAdmins] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateStatusValue, setUpdateStatusValue] = useState('');
  const [updateRemarks, setUpdateRemarks] = useState('');
  const [submitStatus, setSubmitStatus] = useState(''); // pending, success, error
  const [error, setError] = useState('');

  // Decode JWT and get user info
  useEffect(() => {
    const authToken = localStorage.getItem('auth_token');
    if (!authToken) {
      window.location.href = '/login';
      return;
    }

    try {
      const decoded = JSON.parse(atob(authToken.split('.')[1]));
      setUser(decoded);
      setToken(authToken);
    } catch (error) {
      console.error('Failed to decode token:', error);
      localStorage.clear();
      window.location.href = '/login';
    }
  }, []);

  // Fetch complaints based on selected status
  useEffect(() => {
    if (!token) return;

    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const response = await getAllComplaints(token);
        const allComplaints = response.data || [];
        let filteredComplaints = allComplaints;

        // Filter by status if not 'all'
        if (selectedStatus !== 'all') {
          filteredComplaints = filteredComplaints.filter(
            (complaint) => complaint.status === selectedStatus
          );
        }

        setComplaints(filteredComplaints);

        const statsData = {
          pending: allComplaints.filter((c) => c.status === 'pending').length,
          in_progress: allComplaints.filter((c) => c.status === 'in_progress').length,
          resolved: allComplaints.filter((c) => c.status === 'resolved').length,
          rejected: allComplaints.filter((c) => c.status === 'rejected').length
        };
        setStats(statsData);

        if (user?.role === 'super_admin') {
          const adminResponse = await getAdmins(token);
          setAdmins(adminResponse.data || []);
        } else {
          setAdmins([]);
        }
      } catch (error) {
        console.error('Failed to fetch complaints:', error);
        setError(error.message || 'Failed to fetch dashboard data');
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token, selectedStatus, user?.role]);

  // Handle view complaint detail
  const handleViewComplaint = useCallback(
    async (complaintId) => {
      try {
        const response = await getComplaintDetails(complaintId, token);
        setSelectedComplaint(response.data);
        setUpdateStatusValue(response.data.status || '');
        setUpdateRemarks('');
        setSubmitStatus('');
      } catch (error) {
        console.error('Failed to fetch complaint details:', error);
      }
    },
    [token]
  );

  // Handle update complaint status
  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!updateStatusValue) return;

    setUpdating(true);
    setSubmitStatus('pending');

    try {
      await updateComplaintStatus(selectedComplaint.id, updateStatusValue, token, updateRemarks);

      setSubmitStatus('success');

      // Refresh complaint detail
      setTimeout(() => {
        handleViewComplaint(selectedComplaint.id);
      }, 500);

      // Refresh complaints list
      try {
        const response = await getAllComplaints(token);
        let filteredComplaints = response.data || [];

        if (selectedStatus !== 'all') {
          filteredComplaints = filteredComplaints.filter(
            (complaint) => complaint.status === selectedStatus
          );
        }

        setComplaints(filteredComplaints);

        // Update stats
        const allComplaints = response.data || [];
        const statsData = {
          pending: allComplaints.filter((c) => c.status === 'pending').length,
          in_progress: allComplaints.filter((c) => c.status === 'in_progress').length,
          resolved: allComplaints.filter((c) => c.status === 'resolved').length,
          rejected: allComplaints.filter((c) => c.status === 'rejected').length
        };
        setStats(statsData);
      } catch (err) {
        console.error('Failed to refresh complaints:', err);
      }

      // Close modal and reset after 1.5 seconds
      setTimeout(() => {
        setSelectedComplaint(null);
        setSubmitStatus('');
        setUpdating(false);
        setUpdateStatusValue('');
        setUpdateRemarks('');
      }, 1500);
    } catch (error) {
      console.error('Failed to update complaint:', error);
      setError(error.message || 'Failed to update complaint');
      setSubmitStatus('error');
      setUpdating(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    if (status === 'in_progress') return 'bg-blue-100 text-blue-800';
    if (status === 'resolved') return 'bg-green-100 text-green-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusLabel = (status) => {
    if (status === 'in_progress') return 'In Progress';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const totalStats = stats.pending + stats.in_progress + stats.resolved + stats.rejected;
  const chartItems = [
    { label: 'Pending', value: stats.pending, className: 'bg-yellow-500' },
    { label: 'In Progress', value: stats.in_progress, className: 'bg-blue-500' },
    { label: 'Resolved', value: stats.resolved, className: 'bg-green-500' },
    { label: 'Rejected', value: stats.rejected, className: 'bg-red-500' }
  ];
  const statusOptions = [
    {
      label: 'Pending',
      value: 'pending',
      activeClass: 'border-yellow-700 bg-yellow-600 text-white',
      idleClass: 'border-yellow-200 bg-yellow-100 text-yellow-700 hover:border-yellow-400'
    },
    {
      label: 'In Progress',
      value: 'in_progress',
      activeClass: 'border-blue-700 bg-blue-600 text-white',
      idleClass: 'border-blue-200 bg-blue-100 text-blue-700 hover:border-blue-400'
    },
    {
      label: 'Resolved',
      value: 'resolved',
      activeClass: 'border-green-700 bg-green-600 text-white',
      idleClass: 'border-green-200 bg-green-100 text-green-700 hover:border-green-400'
    },
    {
      label: 'Rejected',
      value: 'rejected',
      activeClass: 'border-red-700 bg-red-600 text-white',
      idleClass: 'border-red-200 bg-red-100 text-red-700 hover:border-red-400'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2 className="text-xl font-bold text-gray-900">Admin Dashboard</h2>
              <div className="h-6 border-l border-gray-300"></div>
              <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium">
                {user.role === 'super_admin' ? 'Super Admin' : user.dept_name || 'Department'}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Welcome, <span className="font-semibold text-gray-900">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 active:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl p-5 shadow-sm border bg-yellow-50 border-yellow-200">
            <p className="text-4xl font-bold text-yellow-700">{stats.pending}</p>
            <p className="text-sm font-medium text-yellow-600 mt-1">Pending</p>
          </div>
          <div className="rounded-xl p-5 shadow-sm border bg-blue-50 border-blue-200">
            <p className="text-4xl font-bold text-blue-700">{stats.in_progress}</p>
            <p className="text-sm font-medium text-blue-600 mt-1">In Progress</p>
          </div>
          <div className="rounded-xl p-5 shadow-sm border bg-green-50 border-green-200">
            <p className="text-4xl font-bold text-green-700">{stats.resolved}</p>
            <p className="text-sm font-medium text-green-600 mt-1">Resolved</p>
          </div>
          <div className="rounded-xl p-5 shadow-sm border bg-red-50 border-red-200">
            <p className="text-4xl font-bold text-red-700">{stats.rejected}</p>
            <p className="text-sm font-medium text-red-600 mt-1">Rejected</p>
          </div>
        </div>

        {error ? (
          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
        ) : null}

        <div className="grid gap-6 mb-8 lg:grid-cols-2">
          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Status Graph</h3>
              <span className="text-xs font-medium text-gray-500">{totalStats} complaints</span>
            </div>
            <div className="mt-5 space-y-4">
              {chartItems.map((item) => (
                <div key={item.label}>
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600">
                    <span>{item.label}</span>
                    <span>{item.value}</span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className={`h-full rounded-full ${item.className}`}
                      style={{ width: `${totalStats ? Math.max((item.value / totalStats) * 100, item.value ? 6 : 0) : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-800">
              {user.role === 'super_admin' ? 'Admin Control' : 'Department Scope'}
            </h3>
            {user.role === 'super_admin' ? (
              <div className="mt-4 max-h-64 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                    <tr>
                      <th className="px-3 py-2 text-left">Admin</th>
                      <th className="px-3 py-2 text-left">Department</th>
                      <th className="px-3 py-2 text-left">Complaints</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map((admin) => (
                      <tr key={admin.admin_id} className="border-b border-gray-100">
                        <td className="px-3 py-2">
                          <p className="font-medium text-gray-800">{admin.name}</p>
                          <p className="text-xs text-gray-500">{admin.email}</p>
                        </td>
                        <td className="px-3 py-2 text-gray-700">
                          {admin.role === 'super_admin' ? 'All departments' : admin.dept_name || 'N/A'}
                        </td>
                        <td className="px-3 py-2 font-semibold text-gray-800">{admin.total_complaints || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-4 text-sm leading-6 text-gray-600">
                You can view and update all complaint categories from {user.dept_name || 'your department'}.
              </p>
            )}
          </section>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          {[
            { label: 'All', value: 'all' },
            { label: 'Pending', value: 'pending' },
            { label: 'In Progress', value: 'in_progress' },
            { label: 'Resolved', value: 'resolved' },
            { label: 'Rejected', value: 'rejected' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedStatus(tab.value)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                selectedStatus === tab.value
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Complaints Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <p>Loading complaints...</p>
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No complaints found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">#</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">Title</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">
                    Student Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">Tags</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">Date</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs uppercase font-semibold text-gray-500">Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint, index) => (
                  <tr
                    key={complaint.id}
                    className="border-b border-gray-100 hover:bg-gray-50 text-sm"
                  >
                    <td className="px-6 py-4 text-gray-700">{index + 1}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">{complaint.title}</td>
                    <td className="px-6 py-4 text-gray-700">{complaint.student_name}</td>
                    <td className="px-6 py-4 text-gray-700">{complaint.category || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">{complaint.dept_name || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-700">
                      {complaint.tags?.length > 0 ? complaint.tags.map((tag) => tag.tag_name).join(', ') : 'None'}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {new Date(complaint.created_at || complaint.submitted_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(
                          complaint.status
                        )}`}
                      >
                        {getStatusLabel(complaint.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleViewComplaint(complaint.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs hover:bg-blue-700 transition"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => setSelectedComplaint(null)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-1 transition"
              title="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Student Information */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-2">Student Information</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-sm font-medium text-gray-800">{selectedComplaint.student_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Email</p>
                  <p className="text-sm font-medium text-gray-800">{selectedComplaint.student_email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Phone</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.student_phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Profile</p>
                  <p className="text-sm font-medium text-gray-800">
                    Sem {selectedComplaint.semester || '-'} / Sec {selectedComplaint.section || '-'}
                  </p>
                </div>
              </div>
            </div>

            {/* Complaint Information */}
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Title</p>
                  <p className="text-sm font-medium text-gray-800">{selectedComplaint.title}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="text-sm font-medium text-gray-800">{selectedComplaint.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Department</p>
                  <p className="text-sm font-medium text-gray-800">{selectedComplaint.dept_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Tags</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selectedComplaint.tags?.length > 0
                      ? selectedComplaint.tags.map((tag) => tag.tag_name).join(', ')
                      : 'None'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(selectedComplaint.created_at || selectedComplaint.submitted_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                  {selectedComplaint.description}
                </p>
              </div>
            </div>

            {/* Status Timeline */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Status History</p>
              <div className="space-y-2">
                {selectedComplaint.status_history && selectedComplaint.status_history.length > 0 ? (
                  selectedComplaint.status_history.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 border-b border-gray-100 pb-2 mb-2"
                    >
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(
                          item.status.toLowerCase().replace(/\s+/g, '_')
                        )}`}
                      >
                        {item.status}
                      </span>
                      <p className="text-sm text-gray-600 flex-1">{item.remarks}</p>
                      <p className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(item.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No status updates yet.</p>
                )}
              </div>
            </div>

            {/* Update Status Form */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              <p className="text-sm font-semibold text-gray-700 mb-3">Update Complaint Status</p>
              
              {/* Quick Action Buttons */}
              <div className="grid grid-cols-4 gap-2 mb-4">
                {statusOptions.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setUpdateStatusValue(status.value)}
                    className={`rounded-lg border-2 px-3 py-2 text-xs font-semibold transition ${
                      updateStatusValue === status.value
                        ? status.activeClass
                        : status.idleClass
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleUpdateStatus} className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1">Current Status</label>
                  <div className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700">
                    {getStatusLabel(selectedComplaint.status)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1">New Status</label>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={updateStatusValue}
                      onChange={(e) => setUpdateStatusValue(e.target.value)}
                      className="col-span-2 border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                      <option value="">-- Select New Status --</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 font-medium mb-1">Remarks (Optional)</label>
                  <textarea
                    value={updateRemarks}
                    onChange={(e) => setUpdateRemarks(e.target.value)}
                    placeholder="Add remarks or resolution notes..."
                    rows="3"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={updating || !updateStatusValue}
                  className={`w-full px-6 py-3 rounded-lg font-medium text-white transition ${
                    submitStatus === 'success'
                      ? 'bg-green-600'
                      : submitStatus === 'error'
                      ? 'bg-red-500'
                      : updating
                      ? 'bg-blue-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {submitStatus === 'success'
                    ? '✓ Updated Successfully!'
                    : submitStatus === 'error'
                    ? '✗ Failed, try again'
                    : updating
                    ? 'Updating...'
                    : 'Update Status'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
