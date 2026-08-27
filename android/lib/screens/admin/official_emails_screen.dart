import 'package:flutter/material.dart';
import '../../api/api_service.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';

class OfficialEmailsScreen extends StatefulWidget {
  const OfficialEmailsScreen({super.key});

  @override
  State<OfficialEmailsScreen> createState() => _OfficialEmailsScreenState();
}

class _OfficialEmailsScreenState extends State<OfficialEmailsScreen> {
  final _api = ApiService();
  List<dynamic> _emails = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadEmails();
  }

  Future<void> _loadEmails() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _api.getOfficialEmails();
      if (response.statusCode == 200) {
        setState(() {
          _emails = response.data;
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

  void _showAddEmailDialog() {
    final emailController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Add Official Email'),
        content: TextField(
          controller: emailController,
          decoration: const InputDecoration(
            labelText: 'Email Address',
            hintText: 'example@company.com',
          ),
          keyboardType: TextInputType.emailAddress,
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (emailController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Please enter an email')),
                );
                return;
              }

              try {
                await _api.createOfficialEmail(emailController.text.trim());

                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Email added successfully')),
                  );
                  _loadEmails();
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
            child: const Text('Add'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteEmail(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Email'),
        content: const Text('Are you sure you want to delete this email?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await _api.deleteOfficialEmail(id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Email deleted')),
          );
          _loadEmails();
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Failed: ${e.toString()}')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Official Emails'),
      ),
      body: _loading
          ? const LoadingIndicator(message: 'Loading emails...')
          : _error != null
              ? ErrorMessage(message: _error!, onRetry: _loadEmails)
              : _emails.isEmpty
                  ? const Center(child: Text('No official emails found'))
                  : RefreshIndicator(
                      onRefresh: _loadEmails,
                      child: ListView.builder(
                        itemCount: _emails.length,
                        itemBuilder: (context, index) {
                          final email = _emails[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ListTile(
                              leading: const CircleAvatar(
                                child: Icon(Icons.email),
                              ),
                              title: Text(
                                email['email'] ?? '',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Text(
                                'Added: ${email['created_at'].toString().split('T')[0]}',
                                style: TextStyle(
                                  fontSize: 12,
                                  color: Colors.grey[600],
                                ),
                              ),
                              trailing: IconButton(
                                icon:
                                    const Icon(Icons.delete, color: Colors.red),
                                onPressed: () => _deleteEmail(email['id']),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddEmailDialog,
        icon: const Icon(Icons.add),
        label: const Text('Add Email'),
      ),
    );
  }
}
