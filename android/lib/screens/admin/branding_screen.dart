import 'package:flutter/material.dart';
import '../../api/api_service.dart';
import '../../widgets/loading_indicator.dart';

class BrandingScreen extends StatefulWidget {
  const BrandingScreen({super.key});

  @override
  State<BrandingScreen> createState() => _BrandingScreenState();
}

class _BrandingScreenState extends State<BrandingScreen> {
  final _api = ApiService();
  final _formKey = GlobalKey<FormState>();

  final _nameController = TextEditingController();
  final _addressController = TextEditingController();
  final _phoneController = TextEditingController();
  final _emailController = TextEditingController();
  final _mapsController = TextEditingController();
  final _logoUrlController = TextEditingController();

  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadBranding();
  }

  Future<void> _loadBranding() async {
    setState(() => _loading = true);
    try {
      final response = await _api.getBranding();
      if (response.statusCode == 200) {
        final data = response.data;
        _nameController.text = data['name'] ?? '';
        _addressController.text = data['address'] ?? '';
        _phoneController.text = data['phone'] ?? '';
        _emailController.text = data['email_support'] ?? '';
        _mapsController.text = data['maps_location'] ?? '';
        _logoUrlController.text = data['logo_url'] ?? '';
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to load: ${e.toString()}')),
        );
      }
    }
    setState(() => _loading = false);
  }

  Future<void> _saveBranding() async {
    if (!_formKey.currentState!.validate()) return;

    try {
      await _api.updateBranding({
        'name': _nameController.text,
        'address': _addressController.text,
        'phone': _phoneController.text,
        'email_support': _emailController.text,
        'maps_location': _mapsController.text,
        'logo_url': _logoUrlController.text,
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Branding updated successfully')),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Branding Settings'),
        actions: [
          IconButton(
            icon: const Icon(Icons.save),
            onPressed: _saveBranding,
          ),
        ],
      ),
      body: _loading
          ? const LoadingIndicator(message: 'Loading branding...')
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Company Name',
                        border: OutlineInputBorder(),
                      ),
                      validator: (value) =>
                          value?.isEmpty == true ? 'Required' : null,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _addressController,
                      decoration: const InputDecoration(
                        labelText: 'Address',
                        border: OutlineInputBorder(),
                      ),
                      maxLines: 2,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _phoneController,
                      decoration: const InputDecoration(
                        labelText: 'Phone (WhatsApp)',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.phone,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(
                        labelText: 'Support Email',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.emailAddress,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _mapsController,
                      decoration: const InputDecoration(
                        labelText: 'Maps Location URL',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.url,
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _logoUrlController,
                      decoration: const InputDecoration(
                        labelText: 'Logo URL',
                        border: OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.url,
                    ),
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        onPressed: _saveBranding,
                        icon: const Icon(Icons.save),
                        label: const Text('Save Changes'),
                        style: ElevatedButton.styleFrom(
                          padding: const EdgeInsets.all(16),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _addressController.dispose();
    _phoneController.dispose();
    _emailController.dispose();
    _mapsController.dispose();
    _logoUrlController.dispose();
    super.dispose();
  }
}
