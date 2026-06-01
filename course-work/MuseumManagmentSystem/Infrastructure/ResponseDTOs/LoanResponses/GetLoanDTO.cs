namespace MuseumManagmentSystem.Infrastructure.ResponseDTOs.LoanResponses
{
    public class GetLoanDTO
    {
        public int ID { get; set; }
        public string PartnerName { get; set; }
        public char LoanType { get; set; } 
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

    }
}
