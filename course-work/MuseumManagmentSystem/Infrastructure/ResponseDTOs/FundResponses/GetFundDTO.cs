using MuseumManagmentSystem.Entities;

namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.FundResponses
{
    public class GetFundDTO
    {
        public int ID { get; set; }
        public DateTime DT { get; set; }
        public int PartnerID { get; set; }
       
        public decimal Amount { get; set; }
        public string Currency { get; set; }
        public string Reason { get; set; }
        public int StudyID { get; set; }
    }
}
