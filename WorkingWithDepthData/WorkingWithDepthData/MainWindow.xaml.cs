// (c) Copyright Microsoft Corporation.
// This source is subject to the Microsoft Public License (Ms-PL).
// Please see http://go.microsoft.com/fwlink/?LinkID=131993 for details.
// All other rights reserved.

using System;
using System.Collections.Generic;
using System.Linq;
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
using Microsoft.Kinect;
using System.Windows.Media.Media3D;

using System.Diagnostics;
using System.Threading;
using System.Runtime.InteropServices;

namespace WorkingWithDepthData
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        GeometryModel3D[] points = new GeometryModel3D[320 * 240];
        int s = 4;
        int hitThreshold = 120;

        //Cursor Control events
        [DllImport("user32")]

        public static extern int SetCursorPos(int x, int y);

        private const int MOUSEEVENTF_MOVE = 0x0001;
        private const int MOUSEEVENTF_LEFTDOWN = 0x0002;
        private const int MOUSEEVENTF_LEFTUP = 0x0004;
        private const int MOUSEEVENTF_RIGHTDOWN = 0x0008;

        [DllImport("user32.dll",
            CharSet = CharSet.Auto, CallingConvention = CallingConvention.StdCall)]

        public static extern void mouse_event(int dwflags, int dx, int dy, int cButtons, int dwExtraInfo);

        public MainWindow()
        {
            InitializeComponent();
        }

        const float MaxDepthDistance = 4095; // max value returned
        const float MinDepthDistance = 50; // min value returned
        const float MaxDepthDistanceOffset = MaxDepthDistance - MinDepthDistance;

        void DepthFrameReady(object sender, DepthImageFrameReadyEventArgs e)
        {
            DepthImageFrame imageFrame = e.OpenDepthImageFrame();
            if (imageFrame != null)
            {
                short[] pixelData = new short[imageFrame.PixelDataLength];
                imageFrame.CopyPixelDataTo(pixelData);
                int temp = 0;
                //dean
                double tempX = 0, tempY = 0, tempZ = 0;

                int i = 0;
                int counter = 0;
                for (int y = 0; y < 240; y += s)
                    for (int x = 0; x < 320; x += s)
                    {
                        temp = ((ushort)pixelData[x + y * 320]) >> 3;
                        ((TranslateTransform3D)points[i].Transform).OffsetZ = temp;
                        if ((temp > 30) && (temp < 1000)) //select from the ones 
                        {
                            counter++;
                            //if (tempX < points[i].Geometry.Bounds.X)

                                if (tempY < points[i].Geometry.Bounds.Y)
                                {
                                    tempY = points[i].Geometry.Bounds.Y;
                                    tempX = points[i].Geometry.Bounds.X;
                                }
                            if (points[i].Geometry.Bounds.Z < temp)
                                tempZ = temp;
                        }

                        i++;
                    }

                this.hitLabel.Content = "counter: " + counter.ToString() + "\n";
                if (tempY > hitThreshold && counter > 200)
                {
                    this.hitLabel2.Content = "Hit! " + tempX.ToString() + " X, " + tempY.ToString() + " Y, " + tempZ.ToString() + " Z\n" +
                        "myX" + ProcessGesture(tempX, tempY, tempZ); //was tempY!

                }
                else
                    this.hitLabel2.Content = "";




            }
        }
        private int ProcessGesture(double tempX, double tempY, double tempZ)
        {
           //SetCursorPos(1366, 768);
            int topofscreen = 136;
            int bottomofscreen = 250;
            //730 360
            int leftofscreen = 720;
            int rightofscreen = 400;
            if (leftofscreen > 0 && rightofscreen > 0 && bottomofscreen > 0 && topofscreen > 0)
            {
                int width = leftofscreen - rightofscreen;
                int height = bottomofscreen - topofscreen;
                int myX = Convert.ToInt32(((Convert.ToDouble(leftofscreen - tempZ)) / width) * 1366);
                int myY = Convert.ToInt32(((Convert.ToDouble(tempX - topofscreen)) / height) * 768);
                if (myX < 0 || myY < 0)
                {
                    return 0;
                }
                this.hitLabel.Content = "MyX: " + myX + " . MyY: " + myY;
                SetCursorPos(myX, myY);
               /*if (tempY > 170)
                {
                   mouse_event(MOUSEEVENTF_LEFTDOWN, 0, 0, 0, 0);
                   mouse_event(MOUSEEVENTF_LEFTUP, 0, 0, 0, 0);

                }*/
            }
            
            return 0;
        }
       

        private GeometryModel3D Triangle(double x, double y, double s, SolidColorBrush color)
        {
            Point3DCollection corners = new Point3DCollection();
            corners.Add(new Point3D(x, y, 0));
            corners.Add(new Point3D(x, y + s, 0));
            corners.Add(new Point3D(x + s, y + s, 0));

           
        


            Int32Collection Triangles = new Int32Collection();
            Triangles.Add(0);
            Triangles.Add(1);
            Triangles.Add(2);

            MeshGeometry3D tmesh = new MeshGeometry3D();
            tmesh.Positions = corners;
            tmesh.TriangleIndices = Triangles;
            tmesh.Normals.Add(new Vector3D(0, 0, -1));

            GeometryModel3D msheet = new GeometryModel3D();
            msheet.Geometry = tmesh;
            msheet.Material = new DiffuseMaterial(color);
            return msheet;
        }


        private void Window_Loaded(object sender, RoutedEventArgs e)
        {
            kinectSensorChooser1.KinectSensorChanged += new DependencyPropertyChangedEventHandler(kinectSensorChooser1_KinectSensorChanged);
            DirectionalLight DirLight1 = new DirectionalLight();
            DirLight1.Color = Colors.White;
            DirLight1.Direction = new Vector3D(1, 1, 1);


            PerspectiveCamera Camera1 = new PerspectiveCamera();
            Camera1.FarPlaneDistance = 2000;
            Camera1.NearPlaneDistance = 10;
            Camera1.FieldOfView = 10;
            Camera1.Position = new Point3D(160, 120, -1000);
            Camera1.LookDirection = new Vector3D(0, 0, 1);
            Camera1.UpDirection = new Vector3D(0, -1, 0);

            Model3DGroup modelGroup = new Model3DGroup();

            int i = 0;

            for (int y = 0; y < 240; y += s) //was 240
            {
                for (int x = 0; x < 320; x += s)
                {
                    points[i] = Triangle(x, y, s, new SolidColorBrush(Colors.White));
                    
//hitLabel.SetValue("hit: " + x.ToString() + " " y.ToString
                    //points[i]=MCube(x,y);
                    points[i].Transform = new TranslateTransform3D(0, 0, 0);
                    modelGroup.Children.Add(points[i]);
                    
                    i++;
                }
            }


         
            modelGroup.Children.Add(DirLight1);
            ModelVisual3D modelsVisual = new ModelVisual3D();
            modelsVisual.Content = modelGroup;
            Viewport3D myViewport = new Viewport3D();
            myViewport.IsHitTestVisible = false;
            myViewport.Camera = Camera1;
            myViewport.Children.Add(modelsVisual);
            canvas1.Children.Add(myViewport);

            myViewport.Height = canvas1.Height;
            myViewport.Width = canvas1.Width;
            Canvas.SetTop(myViewport, 0);
            Canvas.SetLeft(myViewport, 0);

        }

        void kinectSensorChooser1_KinectSensorChanged(object sender, DependencyPropertyChangedEventArgs e)
        {

            var oldSensor = (KinectSensor)e.OldValue;

            //stop the old sensor
            if (oldSensor != null)
            {
                oldSensor.Stop();
                oldSensor.AudioSource.Stop();
            }

            //get the new sensor
            var newSensor = (KinectSensor)e.NewValue;
            if (newSensor == null)
            {
                return;
            }

            //turn on features that you need
            newSensor.DepthStream.Enable(DepthImageFormat.Resolution320x240Fps30);
            newSensor.DepthStream.Range = DepthRange.Near; // Depth in near range enabled
            newSensor.SkeletonStream.Enable(); 
           // newSensor.SkeletonStream.EnableTrackingInNearRange = true; // enable returning skeletons while depth is in Near Range
           // newSensor.SkeletonStream.TrackingMode = SkeletonTrackingMode.Seated; // Use seated tracking

           

            //sign up for events if you want to get at API directly
         //   newSensor.AllFramesReady += new EventHandler<AllFramesReadyEventArgs>(newSensor_AllFramesReady);
            newSensor.DepthFrameReady += DepthFrameReady;


            try
            {
                newSensor.Start();
            }
            catch (System.IO.IOException)
            {
                //this happens if another app is using the Kinect
                kinectSensorChooser1.AppConflictOccurred();
            }
        }

           //if  (((TranslateTransform3D)points[i].Transform).OffsetZ < 60)
           //                 Console.WriteLine("found " + i);
           //             this.hitLabel.Content = "hit: " + ((TranslateTransform3D)points[i].Transform).OffsetZ.ToString();

        void newSensor_AllFramesReady(object sender, AllFramesReadyEventArgs e)
        {
            
            using (DepthImageFrame depthFrame = e.OpenDepthImageFrame())
            {
                if (depthFrame == null)
                {
                    return; 
                }

                byte[] pixels = GenerateColoredBytes(depthFrame);

                //number of bytes per row width * 4 (B,G,R,Empty)
                int stride = depthFrame.Width * 4;

                //create image
                image1.Source = 
                    BitmapSource.Create(depthFrame.Width, depthFrame.Height, 
                    96, 96, PixelFormats.Bgr32, null, pixels, stride); 

            }
        }


        private byte[] GenerateColoredBytes(DepthImageFrame depthFrame)
        {

            //get the raw data from kinect with the depth for every pixel
            short[] rawDepthData = new short[depthFrame.PixelDataLength];
            depthFrame.CopyPixelDataTo(rawDepthData); 

            //use depthFrame to create the image to display on-screen
            //depthFrame contains color information for all pixels in image
            //Height x Width x 4 (Red, Green, Blue, empty byte)
            Byte[] pixels = new byte[depthFrame.Height * depthFrame.Width * 4];

            //Bgr32  - Blue, Green, Red, empty byte
            //Bgra32 - Blue, Green, Red, transparency 
            //You must set transparency for Bgra as .NET defaults a byte to 0 = fully transparent

            //hardcoded locations to Blue, Green, Red (BGR) index positions       
            const int BlueIndex = 0;
            const int GreenIndex = 1;
            const int RedIndex = 2;

            
            //loop through all distances
            //pick a RGB color based on distance
            for (int depthIndex = 0, colorIndex = 0; 
                depthIndex < rawDepthData.Length && colorIndex < pixels.Length; 
                depthIndex++, colorIndex += 4)
            {
                //get the player (requires skeleton tracking enabled for values)
                int player = rawDepthData[depthIndex] & DepthImageFrame.PlayerIndexBitmask;

                //gets the depth value
                int depth = rawDepthData[depthIndex] >> DepthImageFrame.PlayerIndexBitmaskWidth;

                //.9M or 2.95'
                if (depth <= 900)
                {
                    //we are very close
                    pixels[colorIndex + BlueIndex] = 255;
                    pixels[colorIndex + GreenIndex] = 0;
                    pixels[colorIndex + RedIndex] = 0;

                }
                // .9M - 2M or 2.95' - 6.56'
                else if (depth > 900 && depth < 2000)
                {
                    //we are a bit further away
                    pixels[colorIndex + BlueIndex] = 0;
                    pixels[colorIndex + GreenIndex] = 255;
                    pixels[colorIndex + RedIndex] = 0;
                }
                // 2M+ or 6.56'+
                else if (depth > 2000)
                {
                    //we are the farthest
                    pixels[colorIndex + BlueIndex] = 0;
                    pixels[colorIndex + GreenIndex] = 0;
                    pixels[colorIndex + RedIndex] = 255;
                }


                ////equal coloring for monochromatic histogram
                byte intensity = CalculateIntensityFromDepth(depth);
                pixels[colorIndex + BlueIndex] = intensity;
                pixels[colorIndex + GreenIndex] = intensity;
                pixels[colorIndex + RedIndex] = intensity;


                //Color all players "gold"
                if (player > 0)
                {
                    pixels[colorIndex + BlueIndex] = Colors.Gold.B;
                    pixels[colorIndex + GreenIndex] = Colors.Gold.G;
                    pixels[colorIndex + RedIndex] = Colors.Gold.R;
                }

            }
          

            return pixels;
        }


        public static byte CalculateIntensityFromDepth(int distance)
        {
            //formula for calculating monochrome intensity for histogram
            return (byte)(255 - (255 * Math.Max(distance - MinDepthDistance, 0) 
                / (MaxDepthDistanceOffset)));
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            StopKinect(kinectSensorChooser1.Kinect); 
        }

        private void StopKinect(KinectSensor sensor)
        {
            if (sensor != null)
            {
                if (sensor.IsRunning)
                {
                    //stop sensor 
                    sensor.Stop();

                    //stop audio if not null
                    if (sensor.AudioSource != null)
                    {
                        sensor.AudioSource.Stop();
                    }


                }
            }
        } 



    }

}

