import 'package:flutter/material.dart';
import '../../api/api_service.dart';
import '../../models/agent.dart';
import '../../models/company.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';

class AgentsScreen extends StatefulWidget {
  const AgentsScreen({super.key});

  @override
  State<AgentsScreen> createState() => _AgentsScreenState();
}

class _AgentsScreenState extends State<AgentsScreen> {
  final _api = ApiService();
  List<Agent> _agents = [];
  List<Company> _companies = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    await Future.wait([
      _loadAgents(),
      _loadCompanies(),
    ]);
  }

  Future<void> _loadAgents() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _api.getAgents();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        setState(() {
          _agents = data.map((json) => Agent.fromJson(json)).toList();
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

  Future<void> _loadCompanies() async {
    try {
      final response = await _api.getCompanies();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        setState(() {
          _companies = data.map((json) => Company.fromJson(json)).toList();
        });
      }
    } catch (_) {}
  }

  void _showAddAgentDialog() {
    final nameController = TextEditingController();
    final emailController = TextEditingController();
    final passwordController = TextEditingController();
    String selectedRole = 'Agent';
    int? selectedCompanyId;

    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Add New Agent'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                TextField(
                  controller: nameController,
                  decoration: const InputDecoration(labelText: 'Name'),
                ),
                TextField(
                  controller: emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                  keyboardType: TextInputType.emailAddress,
                ),
                TextField(
                  controller: passwordController,
                  decoration: const InputDecoration(labelText: 'Password'),
                  obscureText: true,
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<String>(
                  value: selectedRole,
                  decoration: const InputDecoration(labelText: 'Role'),
                  items: const [
                    DropdownMenuItem(value: 'Agent', child: Text('Agent')),
                    DropdownMenuItem(value: 'Manager', child: Text('Manager')),
                    DropdownMenuItem(
                        value: 'Superadmin', child: Text('Superadmin')),
                  ],
                  onChanged: (value) {
                    setState(() => selectedRole = value!);
                  },
                ),
                const SizedBox(height: 8),
                DropdownButtonFormField<int>(
                  value: selectedCompanyId,
                  decoration: const InputDecoration(labelText: 'Company'),
                  items: _companies
                      .map((company) => DropdownMenuItem(
                            value: company.id,
                            child: Text(company.name),
                          ))
                      .toList(),
                  onChanged: (value) {
                    setState(() => selectedCompanyId = value);
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () async {
                try {
                  await _api.createAgent({
                    'name': nameController.text,
                    'email': emailController.text,
                    'password': passwordController.text,
                    'role': selectedRole,
                    'company_id': selectedCompanyId,
                  });

                  if (mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                          content: Text('Agent created successfully')),
                    );
                    _loadAgents();
                  }
                } catch (e) {
                  if (mounted) {
                    Navigator.pop(context);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('Failed: ${e.toString()}')),
                    );
                  }
                }
              },
              child: const Text('Create'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agents Management'),
      ),
      body: _loading
          ? const LoadingIndicator(message: 'Loading agents...')
          : _error != null
              ? ErrorMessage(message: _error!, onRetry: _loadAgents)
              : _agents.isEmpty
                  ? const Center(child: Text('No agents found'))
                  : RefreshIndicator(
                      onRefresh: _loadAgents,
                      child: ListView.builder(
                        itemCount: _agents.length,
                        itemBuilder: (context, index) {
                          final agent = _agents[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ListTile(
                              leading: CircleAvatar(
                                child: Text(agent.name[0].toUpperCase()),
                              ),
                              title: Text(
                                agent.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(agent.email),
                                  Text(
                                    '${agent.role}${agent.companyName != null ? ' • ${agent.companyName}' : ''}',
                                    style: TextStyle(
                                      fontSize: 12,
                                      color: Colors.grey[600],
                                    ),
                                  ),
                                ],
                              ),
                              trailing: Chip(
                                label: Text(agent.role),
                                backgroundColor: agent.role == 'Superadmin'
                                    ? Colors.red[100]
                                    : agent.role == 'Manager'
                                        ? Colors.blue[100]
                                        : Colors.green[100],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddAgentDialog,
        icon: const Icon(Icons.add),
        label: const Text('Add Agent'),
      ),
    );
  }
}
