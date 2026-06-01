using MuseumManagmentSystem.Entities;

namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.FundResponses
{
    public class GetFundsDTO
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public string PartnerName { get; set; }
        
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Reason { get; set; }
        public string StudyName { get; set; }
        
    }
}
