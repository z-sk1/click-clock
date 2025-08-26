using System.Net.Http;
using System.Text;
using System.Windows;
using System.Windows.Controls;
using System.Windows.Data;
using System.Windows.Documents;
using System.Windows.Input;
using System.Windows.Media;
using System.Windows.Media.Imaging;
using System.Windows.Navigation;
using System.Windows.Shapes;
using static System.Runtime.InteropServices.JavaScript.JSType;
using Newtonsoft.Json;
using System.Threading.Tasks;

namespace clickclockClient
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        public MainWindow()
        {
            InitializeComponent();
        }

        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            txtInput.Text = "Enter the name of a city...";
            txtInput.Foreground = Brushes.Gray;
        }
        private void txtInput_GotFocus(object sender, RoutedEventArgs e)
        {
            if (txtInput.Text == "Enter the name of a city..." && txtInput.Foreground == Brushes.Gray)
            {
                txtInput.Foreground = Brushes.Black;
                txtInput.Text = "";
            }
        }

        private void txtInput_LostFocus(object sender, RoutedEventArgs e)
        {
            if (string.IsNullOrWhiteSpace(txtInput.Text))
            {
                txtInput.Text = "Enter the name of a city...";
                txtInput.Foreground = Brushes.Gray;
            }
        }
        private void txtInput_KeyDown(object sender, KeyEventArgs e)
        {
            if (e.Key == Key.Enter)
            {
                fetchTime();
            }
        }

        private void btnGet_Click(object sender, RoutedEventArgs e)
        {
            fetchTime();
        }

        private void btnCopy_Click(object sender, RoutedEventArgs e)
        {
            _ = copyData();
        }

        private async void fetchTime()
        {
            string city = txtInput.Text.Trim();

            if (city == "Enter the name of a city here..." && txtInput.Foreground == Brushes.Gray || string.IsNullOrWhiteSpace(city))
            {
                MessageBox.Show("Please enter a valid URL.", "Invalid Input");
                return;
            }

            using (HttpClient client = new HttpClient())
            {
                try
                {
                    string url = $"https://clickclock-service.onrender.com/time?city={Uri.EscapeDataString(city)}";
                    HttpResponseMessage response = await client.GetAsync(url);

                    if (!response.IsSuccessStatusCode)
                    {
                        MessageBox.Show("Failed to fetch time. Please try again later.", "Error");
                        return;
                    }

                    var responseString = await response.Content.ReadAsStringAsync();
                    dynamic data = JsonConvert.DeserializeObject(responseString);

                    string timezoneString = data.timezone;   // e.g., "Asia/Dubai"
                    string[] parts = timezoneString.Split('/'); // Split into ["Asia", "Dubai"]
                    string regionData = parts[0]; // "Asia"
                    string cityData = parts[1];   // "Dubai"
                    string timezone = "UTC" + data.utc_offset; // e.g., "UTC+04:00"
                    string time = data.time;
                    string date = data.Date;

                    string finalString = $"Time in {cityData}: \n Time: {time} \n Region: {regionData} \n Timezone: {timezone} \n Data: {date}";

                    txtResult.Text = finalString;
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"An error occurred while showing the time: {ex.Message}", "Error");
                    return;
                }
            }

        }

        private async Task copyData()
        {
            if (string.IsNullOrWhiteSpace(txtResult.Text))
            {
                MessageBox.Show("No data to copy. Please fetch the time first.", "Error");
                return;
            }
            Clipboard.SetText(txtResult.Text);
            btnCopy.Content = "Copied!";
            
            await Task.Delay(2000); // Wait for 2 seconds

            Dispatcher.Invoke(() => btnCopy.Content = "Copy");
        }
    }
}