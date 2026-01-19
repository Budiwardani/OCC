import 'package:flutter/material.dart';
import 'dart:io';
import 'package:file_picker/file_picker.dart';
import '../../api/api_service.dart';
import '../../models/complaint.dart';
import '../../models/agent.dart';
import '../../models/response.dart';
import '../../widgets/status_badge.dart';
import '../../widgets/response_bubble.dart';
import '../../widgets/loading_indicator.dart';

class ComplaintDetailAdminScreen extends StatefulWidget {
  final int complaintId;

  const ComplaintDetailAdminScreen({super.key, required this.complaintId});

  @override
  State<ComplaintDetailAdminScreen> createState() =>
      _ComplaintDetailAdminScreenState();
}

class _ComplaintDetailAdminScreenState
    extends State<ComplaintDetailAdminScreen> {
  final _api = ApiService();
  final _responseController = TextEditingController();
  final _forwardEmailController = TextEditingController();

  Complaint? _complaint;
  List<Agent> _agents = [];
  List<ComplaintResponse> _responses = [];
  bool _loading = true;
  bool _isInternal = false;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    setState(() => _loading = true);
    await Future.wait([
      _loadComplaint(),
      _loadAgents(),
    ]);
    setState(() => _loading = false);
  }

  Future<void> _loadComplaint() async {
    try {
      final response = await _api.getComplaint(widget.complaintId);
      if (response.statusCode == 200) {
        setState(() {
          _complaint = Complaint.fromJson(response.data);
          if (_complaint!.responses != null) {
            _responses = (_complaint!.responses as List)
                .map((json) => ComplaintResponse.fromJson(json))
                .toList();
          }
        });
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading complaint: $e')),
        );
      }
    }
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

  Future<void> _updateStatus(String newStatus) async {
    try {
      await _api.updateComplaint(widget.complaintId, {'status': newStatus});
      await _loadComplaint();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Status updated')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to update status: $e')),
        );
      }
    }
  }

  Future<void> _assignAgent(int? agentId) async {
    try {
      await _api
          .updateComplaint(widget.complaintId, {'assigned_agent': agentId});
      await _loadComplaint();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Agent assigned')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to assign agent: $e')),
        );
      }
    }
  }

  Future<void> _addResponse() async {
    if (_responseController.text.trim().isEmpty) return;

    try {
      await _api.addComplaintResponse(
        widget.complaintId,
        _responseController.text.trim(),
        _isInternal,
      );
      _responseController.clear();
      setState(() => _isInternal = false);
      await _loadComplaint();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Response added')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add response: $e')),
        );
      }
    }
  }

  Future<void> _notifyCustomer() async {
    try {
      await _api.notifyComplaint(widget.complaintId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Customer notified')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to notify: $e')),
        );
      }
    }
  }

  Future<void> _forwardComplaint() async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Forward Complaint'),
        content: TextField(
          controller: _forwardEmailController,
          decoration: const InputDecoration(
            labelText: 'Email Address',
            hintText: 'recipient@example.com',
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
              try {
                await _api.forwardComplaint(
                  widget.complaintId,
                  _forwardEmailController.text.trim(),
                );
                _forwardEmailController.clear();
                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Complaint forwarded')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to forward: $e')),
                  );
                }
              }
            },
            child: const Text('Forward'),
          ),
        ],
      ),
    );
  }

  Future<void> _uploadSuratKuasaDraft() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles();
    if (result != null) {
      File file = File(result.files.single.path!);
      try {
        await _api.uploadSuratKuasaDraft(_complaint!.ticketCode, file);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Surat Kuasa draft uploaded')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Upload failed: $e')),
          );
        }
      }
    }
  }

  Future<void> _createInvoice() async {
    if (_complaint == null) return;

    final amountController = TextEditingController();
    final descController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Create Invoice'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
              controller: amountController,
              decoration: const InputDecoration(labelText: 'Amount'),
              keyboardType: TextInputType.number,
            ),
            const SizedBox(height: 8),
            TextField(
              controller: descController,
              decoration: const InputDecoration(labelText: 'Description'),
              maxLines: 3,
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              try {
                await _api.createInvoice({
                  'ticket_code': _complaint!.ticketCode,
                  'customer_name': _complaint!.customerName,
                  'customer_email': _complaint!.customerEmail,
                  'amount': double.parse(amountController.text),
                  'description': descController.text,
                });
                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Invoice created')),
                  );
                }
              } catch (e) {
                if (mounted) {
                  Navigator.pop(context);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Failed to create invoice: $e')),
                  );
                }
              }
            },
            child: const Text('Create'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: LoadingIndicator(message: 'Loading complaint details...'),
      );
    }

    if (_complaint == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Complaint Detail')),
        body: const Center(child: Text('Complaint not found')),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: const Text('Complaint Detail'),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'notify':
                  _notifyCustomer();
                  break;
                case 'forward':
                  _forwardComplaint();
                  break;
                case 'upload_sk':
                  _uploadSuratKuasaDraft();
                  break;
                case 'create_invoice':
                  _createInvoice();
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'notify',
                child: Row(
                  children: [
                    Icon(Icons.notifications),
                    SizedBox(width: 8),
                    Text('Notify Customer'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'forward',
                child: Row(
                  children: [
                    Icon(Icons.forward_to_inbox),
                    SizedBox(width: 8),
                    Text('Forward via Email'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'upload_sk',
                child: Row(
                  children: [
                    Icon(Icons.upload_file),
                    SizedBox(width: 8),
                    Text('Upload Surat Kuasa'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'create_invoice',
                child: Row(
                  children: [
                    Icon(Icons.receipt),
                    SizedBox(width: 8),
                    Text('Create Invoice'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Text(
                    _complaint!.ticketCode,
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.blue,
                    ),
                  ),
                ),
                StatusBadge(status: _complaint!.status),
              ],
            ),
            const SizedBox(height: 16),

            // Status Update
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Update Status:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    DropdownButton<String>(
                      value: _complaint!.status,
                      isExpanded: true,
                      items: const [
                        DropdownMenuItem(value: 'OPEN', child: Text('Open')),
                        DropdownMenuItem(
                            value: 'IN_PROGRESS', child: Text('In Progress')),
                        DropdownMenuItem(
                            value: 'RESOLVED', child: Text('Resolved')),
                        DropdownMenuItem(
                            value: 'CLOSED', child: Text('Closed')),
                      ],
                      onChanged: (value) {
                        if (value != null) _updateStatus(value);
                      },
                    ),
                  ],
                ),
              ),
            ),

            // Assign Agent
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Assign to Agent:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    DropdownButton<int?>(
                      value: _complaint!.assignedAgent,
                      isExpanded: true,
                      hint: const Text('Unassigned'),
                      items: [
                        const DropdownMenuItem(
                          value: null,
                          child: Text('Unassigned'),
                        ),
                        ..._agents.map((agent) => DropdownMenuItem(
                              value: agent.id,
                              child: Text('${agent.name} (${agent.role})'),
                            )),
                      ],
                      onChanged: (value) => _assignAgent(value),
                    ),
                  ],
                ),
              ),
            ),

            const Divider(height: 32),

            // Complaint Details
            const Text(
              'Subject:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text(_complaint!.subject, style: const TextStyle(fontSize: 16)),
            const SizedBox(height: 16),

            const Text(
              'Description:',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 4),
            Text(_complaint!.description, style: const TextStyle(fontSize: 14)),
            const SizedBox(height: 16),

            _buildInfoRow('Customer', _complaint!.customerName),
            _buildInfoRow('Email', _complaint!.customerEmail),
            if (_complaint!.phone != null)
              _buildInfoRow('Phone', _complaint!.phone!),
            _buildInfoRow('Category', _complaint!.category),
            if (_complaint!.location != null)
              _buildInfoRow('Location', _complaint!.location!),
            if (_complaint!.city != null)
              _buildInfoRow('City', _complaint!.city!),
            _buildInfoRow(
                'Created', _complaint!.createdAt.toString().split('.')[0]),

            const Divider(height: 32),

            // Responses
            const Text(
              'Communication History',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 16),
            if (_responses.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(16),
                  child: Text('No responses yet',
                      style: TextStyle(color: Colors.grey)),
                ),
              )
            else
              ..._responses.map((response) => ResponseBubble(
                    response: response,
                    isAgent: response.responderId != null,
                  )),

            const SizedBox(height: 16),

            // Add Response
            Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Add Response:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 8),
                    TextField(
                      controller: _responseController,
                      decoration: const InputDecoration(
                        hintText: 'Type your response...',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 3,
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Checkbox(
                              value: _isInternal,
                              onChanged: (value) {
                                setState(() => _isInternal = value ?? false);
                              },
                            ),
                            const Text('Internal Note'),
                          ],
                        ),
                        ElevatedButton.icon(
                          onPressed: _addResponse,
                          icon: const Icon(Icons.send),
                          label: const Text('Send'),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                  fontWeight: FontWeight.bold, color: Colors.grey),
            ),
          ),
          Expanded(child: Text(value)),
        ],
      ),
    );
  }

  @override
  void dispose() {
    _responseController.dispose();
    _forwardEmailController.dispose();
    super.dispose();
  }
}
