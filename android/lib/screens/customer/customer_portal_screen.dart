import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../api/api_service.dart';
import '../../models/complaint.dart';
import '../../providers/auth_provider.dart';
import '../../widgets/complaint_card.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';
import './complaint_detail_customer_screen.dart';

class CustomerPortalScreen extends StatefulWidget {
  const CustomerPortalScreen({super.key});

  @override
  State<CustomerPortalScreen> createState() => _CustomerPortalScreenState();
}

class _CustomerPortalScreenState extends State<CustomerPortalScreen> {
  final _api = ApiService();
  List<Complaint> _complaints = [];
  bool _loading = true;
  String? _error;
  String _selectedStatus = 'ALL';

  @override
  void initState() {
    super.initState();
    _loadComplaints();
  }

  Future<void> _loadComplaints() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _api.getMyComplaints();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        setState(() {
          _complaints = data.map((json) => Complaint.fromJson(json)).toList();
          _loading = false;
        });
      } else {
        setState(() {
          _error = 'Failed to load complaints';
          _loading = false;
        });
      }
    } catch (e) {
      setState(() {
        _error = 'Error: ${e.toString()}';
        _loading = false;
      });
    }
  }

  List<Complaint> get _filteredComplaints {
    if (_selectedStatus == 'ALL') return _complaints;
    return _complaints
        .where((c) => c.status.toUpperCase() == _selectedStatus)
        .toList();
  }

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('My Complaints'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () {
              authProvider.logout();
              Navigator.pushReplacementNamed(context, '/login');
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Filter chips
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                _buildFilterChip('ALL', 'All'),
                const SizedBox(width: 8),
                _buildFilterChip('OPEN', 'Open'),
                const SizedBox(width: 8),
                _buildFilterChip('IN_PROGRESS', 'In Progress'),
                const SizedBox(width: 8),
                _buildFilterChip('RESOLVED', 'Resolved'),
                const SizedBox(width: 8),
                _buildFilterChip('CLOSED', 'Closed'),
              ],
            ),
          ),

          // Content
          Expanded(
            child: _loading
                ? const LoadingIndicator(message: 'Loading complaints...')
                : _error != null
                    ? ErrorMessage(message: _error!, onRetry: _loadComplaints)
                    : _filteredComplaints.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.inbox,
                                    size: 64, color: Colors.grey[400]),
                                const SizedBox(height: 16),
                                Text(
                                  'No complaints found',
                                  style: TextStyle(
                                    fontSize: 16,
                                    color: Colors.grey[600],
                                  ),
                                ),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadComplaints,
                            child: ListView.builder(
                              itemCount: _filteredComplaints.length,
                              itemBuilder: (context, index) {
                                final complaint = _filteredComplaints[index];
                                return ComplaintCard(
                                  complaint: complaint,
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            ComplaintDetailCustomerScreen(
                                          complaint: complaint,
                                        ),
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.pushNamed(context, '/customer-home');
        },
        icon: const Icon(Icons.add),
        label: const Text('New Complaint'),
      ),
    );
  }

  Widget _buildFilterChip(String value, String label) {
    final isSelected = _selectedStatus == value;
    return ChoiceChip(
      label: Text(label),
      selected: isSelected,
      onSelected: (selected) {
        if (selected) {
          setState(() {
            _selectedStatus = value;
          });
        }
      },
    );
  }
}
