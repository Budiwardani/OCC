import 'package:flutter/material.dart';
import '../../api/api_service.dart';
import '../../models/invoice.dart';
import '../../widgets/loading_indicator.dart';
import '../../widgets/error_message.dart';

class InvoicesScreen extends StatefulWidget {
  const InvoicesScreen({super.key});

  @override
  State<InvoicesScreen> createState() => _InvoicesScreenState();
}

class _InvoicesScreenState extends State<InvoicesScreen> {
  final _api = ApiService();
  List<Invoice> _invoices = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadInvoices();
  }

  Future<void> _loadInvoices() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final response = await _api.getInvoices();
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data;
        setState(() {
          _invoices = data.map((json) => Invoice.fromJson(json)).toList();
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Invoices'),
      ),
      body: _loading
          ? const LoadingIndicator(message: 'Loading invoices...')
          : _error != null
              ? ErrorMessage(message: _error!, onRetry: _loadInvoices)
              : _invoices.isEmpty
                  ? const Center(child: Text('No invoices found'))
                  : RefreshIndicator(
                      onRefresh: _loadInvoices,
                      child: ListView.builder(
                        itemCount: _invoices.length,
                        itemBuilder: (context, index) {
                          final invoice = _invoices[index];
                          return Card(
                            margin: const EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            child: ListTile(
                              leading: const CircleAvatar(
                                child: Icon(Icons.receipt),
                              ),
                              title: Text(
                                invoice.ticketCode,
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              subtitle: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(invoice.customerName),
                                  if (invoice.description != null)
                                    Text(
                                      invoice.description!,
                                      style: TextStyle(
                                        fontSize: 12,
                                        color: Colors.grey[600],
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  Text(
                                    _formatDate(invoice.createdAt),
                                    style: TextStyle(
                                      fontSize: 11,
                                      color: Colors.grey[500],
                                    ),
                                  ),
                                ],
                              ),
                              trailing: Text(
                                'Rp ${invoice.amount.toStringAsFixed(0)}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                  color: Colors.green,
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}
