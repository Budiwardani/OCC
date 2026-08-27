class Agent {
  final int id;
  final String name;
  final String email;
  final String role;
  final int? companyId;
  final String? companyName;
  final DateTime createdAt;

  Agent({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.companyId,
    this.companyName,
    required this.createdAt,
  });

  factory Agent.fromJson(Map<String, dynamic> json) {
    return Agent(
      id: json['id'],
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: json['role'] ?? 'Agent',
      companyId: json['company_id'],
      companyName: json['company_name'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role,
      'company_id': companyId,
      'company_name': companyName,
      'created_at': createdAt.toIso8601String(),
    };
  }
}
