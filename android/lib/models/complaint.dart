class Complaint {
  final int id;
  final String ticketCode;
  final String customerName;
  final String customerEmail;
  final String? phone;
  final String category;
  final String subject;
  final String description;
  final String status;
  final String? location;
  final String? city;
  final int? assignedAgent;
  final String? agentName;
  final DateTime createdAt;
  final List<dynamic>? responses;
  final List<dynamic>? attachments;

  Complaint({
    required this.id,
    required this.ticketCode,
    required this.customerName,
    required this.customerEmail,
    this.phone,
    required this.category,
    required this.subject,
    required this.description,
    required this.status,
    this.location,
    this.city,
    this.assignedAgent,
    this.agentName,
    required this.createdAt,
    this.responses,
    this.attachments,
  });

  factory Complaint.fromJson(Map<String, dynamic> json) {
    return Complaint(
      id: json['id'],
      ticketCode: json['ticket_code'] ?? '',
      customerName: json['customer_name'] ?? '',
      customerEmail: json['customer_email'] ?? '',
      phone: json['phone'],
      category: json['category'] ?? '',
      subject: json['subject'] ?? '',
      description: json['description'] ?? '',
      status: json['status'] ?? 'OPEN',
      location: json['location'],
      city: json['city'],
      assignedAgent: json['assigned_agent'],
      agentName: json['agent_name'],
      createdAt: json['created_at'] != null
          ? DateTime.parse(json['created_at'])
          : DateTime.now(),
      responses: json['responses'],
      attachments: json['attachments'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'ticket_code': ticketCode,
      'customer_name': customerName,
      'customer_email': customerEmail,
      'phone': phone,
      'category': category,
      'subject': subject,
      'description': description,
      'status': status,
      'location': location,
      'city': city,
      'assigned_agent': assignedAgent,
      'agent_name': agentName,
      'created_at': createdAt.toIso8601String(),
      'responses': responses,
      'attachments': attachments,
    };
  }
}
