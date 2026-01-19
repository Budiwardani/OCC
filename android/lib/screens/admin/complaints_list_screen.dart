import 'package:flutter/material.dart';
import '../../api/api_service.dart';
import '../../models/complaint.dart';
import '../../models/category.dart';
import '../../models/agent.dart';
import '../../widgets/complaint_card.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';
import 'complaint_detail_admin_screen.dart';
import 'dart:io';
import 'package:path_provider/path_provider.dart';

class ComplaintsListScreen extends StatefulWidget {
  const ComplaintsListScreen({super.key});

  @override
  State<ComplaintsListScreen> createState() => _ComplaintsListScreenState();
}

class _ComplaintsListScreenState extends State<ComplaintsListScreen> {
  final _api = ApiService();
  final _searchController = TextEditingController();

  List<Complaint> _complaints = [];
  List<Category> _categories = [];
  List<Agent> _agents = [];

  bool _loading = true;
  String? _error;

  String _selectedStatus = 'ALL';
  String? _selectedCategory;
  int? _selectedAgent;
  String? _searchQuery;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadComplaints(),
      _loadCategories(),
      _loadAgents(),
    ]);
  }

  Future<void> _loadComplaints() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _api.getComplaints(
        status: _selectedStatus == 'ALL' ? null : _selectedStatus,
        category: _selectedCategory,
        assignedAgent: _selectedAgent,
        search: _searchQuery,
      );

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

  Future<void> _loadCategories() async {
    try {
      final response = await _api.getCategories();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        setState(() {
          _categories = data.map((json) => Category.fromJson(json)).toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _loadAgents() async {
    try {
      final response = await _api.getAgents();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        setState(() {
          _agents = data.map((json) => Agent.fromJson(json)).toList();
        });
      }
    } catch (_) {}
  }

  Future<void> _exportComplaints() async {
    try {
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const AlertDialog(
          content: Row(
            children: [
              CircularProgressIndicator(),
              SizedBox(width: 16),
              Text('Exporting...'),
            ],
          ),
        ),
      );

      final response = await _api.exportComplaints(_selectedStatus);
      Navigator.pop(context); // Close loading dialog

      if (response.statusCode == 200) {
        // Save file
        final bytes = response.data as List<int>;
        final directory = await getApplicationDocumentsDirectory();
        final file = File(
            '${directory.path}/complaints_export_${DateTime.now().millisecondsSinceEpoch}.csv');
        await file.writeAsBytes(bytes);

        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Exported to: ${file.path}')),
          );
        }
      }
    } catch (e) {
      Navigator.pop(context); // Close loading dialog
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Export failed: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Complaints Management'),
        actions: [
          IconButton(
            icon: const Icon(Icons.download),
            onPressed: _exportComplaints,
            tooltip: 'Export',
          ),
        ],
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: 'Search by ticket code, customer name...',
                prefixIcon: const Icon(Icons.search),
                suffixIcon: _searchQuery != null
                    ? IconButton(
                        icon: const Icon(Icons.clear),
                        onPressed: () {
                          _searchController.clear();
                          setState(() => _searchQuery = null);
                          _loadComplaints();
                        },
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onSubmitted: (value) {
                setState(() => _searchQuery = value.isNotEmpty ? value : null);
                _loadComplaints();
              },
            ),
          ),

          // Filters
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                // Status filter
                DropdownButton<String>(
                  value: _selectedStatus,
                  items: const [
                    DropdownMenuItem(value: 'ALL', child: Text('All Status')),
                    DropdownMenuItem(value: 'OPEN', child: Text('Open')),
                    DropdownMenuItem(
                        value: 'IN_PROGRESS', child: Text('In Progress')),
                    DropdownMenuItem(
                        value: 'RESOLVED', child: Text('Resolved')),
                    DropdownMenuItem(value: 'CLOSED', child: Text('Closed')),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedStatus = value!);
                    _loadComplaints();
                  },
                ),
                const SizedBox(width: 16),

                // Category filter
                DropdownButton<String?>(
                  value: _selectedCategory,
                  hint: const Text('All Categories'),
                  items: [
                    const DropdownMenuItem(
                        value: null, child: Text('All Categories')),
                    ..._categories.map((cat) => DropdownMenuItem(
                          value: cat.id,
                          child: Text(cat.name),
                        )),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedCategory = value);
                    _loadComplaints();
                  },
                ),
                const SizedBox(width: 16),

                // Agent filter
                DropdownButton<int?>(
                  value: _selectedAgent,
                  hint: const Text('All Agents'),
                  items: [
                    const DropdownMenuItem(
                        value: null, child: Text('All Agents')),
                    ..._agents.map((agent) => DropdownMenuItem(
                          value: agent.id,
                          child: Text(agent.name),
                        )),
                  ],
                  onChanged: (value) {
                    setState(() => _selectedAgent = value);
                    _loadComplaints();
                  },
                ),
              ],
            ),
          ),

          const SizedBox(height: 8),

          // Complaints list
          Expanded(
            child: _loading
                ? const LoadingIndicator(message: 'Loading complaints...')
                : _error != null
                    ? ErrorMessage(message: _error!, onRetry: _loadComplaints)
                    : _complaints.isEmpty
                        ? Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.inbox,
                                    size: 64, color: Colors.grey[400]),
                                const SizedBox(height: 16),
                                const Text('No complaints found'),
                              ],
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: _loadComplaints,
                            child: ListView.builder(
                              itemCount: _complaints.length,
                              itemBuilder: (context, index) {
                                final complaint = _complaints[index];
                                return ComplaintCard(
                                  complaint: complaint,
                                  onTap: () async {
                                    await Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (context) =>
                                            ComplaintDetailAdminScreen(
                                          complaintId: complaint.id,
                                        ),
                                      ),
                                    );
                                    _loadComplaints(); // Refresh after returning
                                  },
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}
