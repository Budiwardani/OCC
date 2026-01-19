import 'package:flutter/material.dart';
import '../../api/api_service.dart';
import '../../models/company.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';

class CompaniesScreen extends StatefulWidget {
  const CompaniesScreen({super.key});

  @override
  State<CompaniesScreen> createState() => _CompaniesScreenState();
}

class _CompaniesScreenState extends State<CompaniesScreen> {
  final _api = ApiService();
  List<Company> _companies = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCompanies();
  }

  Future<void> _loadCompanies() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _api.getCompanies();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        setState(() {
          _companies = data.map((json) => Company.fromJson(json)).toList();
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

  void _showCompanyDialog({Company? company}) {
    final nameController = TextEditingController(text: company?.name);
    final addressController = TextEditingController(text: company?.address);
    final phoneController = TextEditingController(text: company?.phone);
    final emailController = TextEditingController(text: company?.emailSupport);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(company == null ? 'Add Company' : 'Edit Company'),
        content: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              TextField(
                controller: nameController,
                decoration: const InputDecoration(labelText: 'Company Name'),
              ),
              TextField(
                controller: addressController,
                decoration: const InputDecoration(labelText: 'Address'),
                maxLines: 2,
              ),
              TextField(
                controller: phoneController,
                decoration: const InputDecoration(labelText: 'Phone'),
                keyboardType: TextInputType.phone,
              ),
              TextField(
                controller: emailController,
                decoration: const InputDecoration(labelText: 'Support Email'),
                keyboardType: TextInputType.emailAddress,
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
                if (company == null) {
                  await _api.createCompany({
                    'name': nameController.text,
                    'address': addressController.text,
                    'phone': phoneController.text,
                    'email_support': emailController.text,
                  });
                } else {
                  await _api.updateCompany(company.id, {
                    'name': nameController.text,
                    'address': addressController.text,
                    'phone': phoneController.text,
                    'email_support': emailController.text,
                  });
                }

                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                        content: Text(company == null
                            ? 'Company created'
                            : 'Company updated')),
                  );
                  _loadCompanies();
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
            child: Text(company == null ? 'Create' : 'Update'),
          ),
        ],
      ),
    );
  }

  Future<void> _deleteCompany(int id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Company'),
        content: const Text('Are you sure you want to delete this company?'),
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
        await _api.deleteCompany(id);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Company deleted')),
          );
          _loadCompanies();
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
        title: const Text('Companies Management'),
      ),
      body: _loading
          ? const LoadingIndicator(message: 'Loading companies...')
          : _error != null
              ? ErrorMessage(message: _error!, onRetry: _loadCompanies)
              : _companies.isEmpty
                  ? const Center(child: Text('No companies found'))
                  : RefreshIndicator(
                      onRefresh: _loadCompanies,
                      child: ListView.builder(
                        itemCount: _companies.length,
                        itemBuilder: (context, index) {
                          final company = _companies[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ListTile(
                              leading: CircleAvatar(
                                child: Text(company.name[0].toUpperCase()),
                              ),
                              title: Text(
                                company.name,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (company.address != null)
                                    Text(company.address!),
                                  if (company.phone != null)
                                    Text('📞 ${company.phone}'),
                                  if (company.emailSupport != null)
                                    Text('📧 ${company.emailSupport}'),
                                ],
                              ),
                              trailing: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  IconButton(
                                    icon: const Icon(Icons.edit,
                                        color: Colors.blue),
                                    onPressed: () =>
                                        _showCompanyDialog(company: company),
                                  ),
                                  IconButton(
                                    icon: const Icon(Icons.delete,
                                        color: Colors.red),
                                    onPressed: () => _deleteCompany(company.id),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => _showCompanyDialog(),
        icon: const Icon(Icons.add),
        label: const Text('Add Company'),
      ),
    );
  }
}
