using MuseumManagmentSystem.Entities;

namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.LoanResponses
{
    public class GetLoansDTO
    {
        public int ID { get; set; }
        public string PartnerName { get; set; }
        public string LoanType { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public string Status { get; set; } 
    }
}
